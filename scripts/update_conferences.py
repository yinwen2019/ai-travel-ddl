#!/usr/bin/env python3
"""AI 顶会 upcoming 数据定时维护脚本（REQ-E02）。

流程（见 .docs/01-requirements.md REQ-E02）：
  A. 读取 conferences.json
  B. 归档已结束 upcoming（end_date < today -> type 改为 history）
  C. 检查每个 conference 是否有 active upcoming
  D. 没有 active upcoming 时按 schedule 创建下一届占位 upcoming
  E. 按关键字段完整性判断哪些 upcoming 需要联网查询
  F. 对需查询的 upcoming 调用 AI/API
  G. 合并 AI 返回（只合并到对应 upcoming，不覆盖非空值）
  H. 有数据变更时更新 meta + 运行摘要
  I. 写回 JSON 并运行 npm run validate；失败则回滚

无数据变更时不写文件（不产生 git diff -> workflow 不创建 PR）。

本地运行：python scripts/update_conferences.py（需 .env 中的 API Key）
"""
from __future__ import annotations

import copy
import json
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Mapping, MutableMapping, Protocol

# 仅依赖标准库 lib 模块，保证 run() 可在无第三方依赖时被测试导入。
# api_client（依赖 requests）在 main() 中延迟导入。
from lib.completeness import is_active_upcoming, is_ended, is_key_fields_complete
from lib.dates import today_iso, utc_now_iso
from lib.logger import write_run_log, write_summary_md
from lib.merger import merge_upcoming
from lib.parser import parse_ai_response
from lib.prompt_builder import build_prompt
from lib.schedule import last_known_year, next_edition_year
from lib.validator import run_validate

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = REPO_ROOT / "data" / "conferences.json"
LOG_DIR = REPO_ROOT / "scripts" / "update_logs"


class AIClient(Protocol):
    """AI 客户端协议（与 lib.api_client.AIClient 一致，此处复述以解耦导入）。"""

    def query(self, system: str, user: str) -> str:  # pragma: no cover - 协议定义
        ...


class SearchClient(Protocol):
    """搜索客户端协议（与 lib.search_client.SearchClient 一致，此处复述以解耦导入）。"""

    def search(self, query: str, max_results: int = 5) -> str:  # pragma: no cover - 协议定义
        ...


@dataclass
class RunResult:
    """单次运行结果。"""

    summary: dict[str, int] = field(
        default_factory=lambda: {
            "archived": 0,
            "created": 0,
            "queried": 0,
            "skipped": 0,
            "updated": 0,
        }
    )
    changed: bool = False
    validate_ok: bool = True
    rolled_back: bool = False
    error: str | None = None


def _read_json(path: Path) -> dict:
    with path.open(encoding="utf-8") as fh:
        return json.load(fh)


def _write_json(path: Path, data: dict) -> None:
    with path.open("w", encoding="utf-8") as fh:
        json.dump(data, fh, indent=2, ensure_ascii=False)
        fh.write("\n")


def _archive_ended_upcoming(conferences: list, today: str) -> int:
    """步骤 B：归档 end_date < today 的 upcoming。返回归档数。"""
    archived = 0
    for conf in conferences:
        for entry in conf.get("years", []):
            if is_ended(entry, today):
                entry["type"] = "history"
                archived += 1
    return archived


def _create_next_upcoming(conferences: list, today: str) -> int:
    """步骤 C+D：无 active upcoming 时按 schedule 创建下一届占位。返回创建数。"""
    created = 0
    for conf in conferences:
        years = conf.get("years", [])
        has_active = any(is_active_upcoming(e, today) for e in years)
        if has_active:
            continue
        ny = next_edition_year(conf, last_known_year(conf))
        if ny is None:
            continue
        # 避免与已存在年份重复
        if any(e.get("year") == ny for e in years):
            continue
        years.append(
            {
                "year": ny,
                "type": "upcoming",
                "city": None,
                "country": None,
                "continent": None,
                "venue": None,
                "url": None,
                "abstract_ddl": [],
                "paper_ddl": [],
                "notification_date": None,
                "camera_ready": None,
                "start_date": None,
                "end_date": None,
            }
        )
        years.sort(key=lambda e: e.get("year", 0))
        created += 1
    return created


def _query_and_merge(
    conferences: list,
    client: AIClient,
    search_client: SearchClient,
    today: str,
) -> tuple[int, int]:
    """步骤 E+F+G：查询并合并不完整的 active upcoming。返回 (queried, updated)。

    对每个不完整的 active upcoming：先用 search_client 联网检索真实网页上下文，
    再将上下文注入 prompt 调用 LLM 抽取字段（搜索接地），最后合并。
    """
    queried = 0
    updated = 0
    for conf in conferences:
        for entry in conf.get("years", []):
            if not is_active_upcoming(entry, today):
                continue
            # 仅由关键字段完整性决定是否查询
            if is_key_fields_complete(entry, conf):
                continue
            queried += 1
            # 搜索接地：拿真实网页上下文
            name = conf.get("name")
            year = entry.get("year")
            search_query = f"{name} {year} conference submission deadline location dates"
            try:
                context = search_client.search(search_query)
            except Exception as exc:  # noqa: BLE001 - 容错：搜索失败等价于无上下文
                print(f"[update] 搜索 {conf.get('id')} {year} 失败: {exc}")
                context = ""
            system, user = build_prompt(conf, entry, search_context=context)
            try:
                raw = client.query(system, user)
            except Exception as exc:  # noqa: BLE001 - 容错：查询失败等价于无新数据
                print(f"[update] 查询 {conf.get('id')} {year} 失败: {exc}")
                raw = ""
            ai_fields = parse_ai_response(raw)
            if ai_fields:
                if merge_upcoming(entry, ai_fields):
                    updated += 1
    return queried, updated


def _count_skipped(conferences: list, today: str) -> int:
    """统计关键字段完整、无需查询的 active upcoming 数量。"""
    skipped = 0
    for conf in conferences:
        for entry in conf.get("years", []):
            if is_active_upcoming(entry, today) and is_key_fields_complete(entry, conf):
                skipped += 1
    return skipped


def run(
    data_path: Path = DATA_PATH,
    repo_root: Path = REPO_ROOT,
    client: AIClient | None = None,
    search_client: SearchClient | None = None,
    today: str | None = None,
    now_utc: str | None = None,
) -> RunResult:
    """执行一次数据更新。返回 RunResult。

    - client: AI 客户端；None 时使用 NullClient（不查询）。
    - search_client: 搜索客户端；None 时使用 NullSearchClient（无搜索接地）。
    - today: 用于判定的日期（YYYY-MM-DD），默认当前 UTC 日期。
    - now_utc: meta 时间戳，默认当前 UTC 时间。
    """
    if today is None:
        today = today_iso()
    if now_utc is None:
        now_utc = utc_now_iso()
    if client is None:
        # 延迟导入以避免在无 requests 时阻断 run() 的可测试性
        from lib.api_client import NullClient

        client = NullClient()
    if search_client is None:
        from lib.search_client import NullSearchClient

        search_client = NullSearchClient()

    result = RunResult()
    try:
        data = _read_json(data_path)
    except (OSError, json.JSONDecodeError) as exc:
        result.validate_ok = False
        result.error = f"读取数据失败: {exc}"
        return result

    original = copy.deepcopy(data)  # 用于校验失败回滚

    # 步骤 B：归档
    result.summary["archived"] = _archive_ended_upcoming(data["conferences"], today)
    # 步骤 C+D：创建下一届
    result.summary["created"] = _create_next_upcoming(data["conferences"], today)
    # 步骤 E+F+G：查询并合并
    queried, updated = _query_and_merge(data["conferences"], client, search_client, today)
    result.summary["queried"] = queried
    result.summary["updated"] = updated
    # 步骤 E 统计：跳过的完整 upcoming
    result.summary["skipped"] = _count_skipped(data["conferences"], today)

    result.changed = (
        result.summary["archived"] + result.summary["created"] + result.summary["updated"] > 0
    )

    if not result.changed:
        # 无数据变更：不写文件，避免产生 git diff / 空 PR
        return result

    # 步骤 H：更新 meta
    meta = data.setdefault("meta", {})
    meta["last_updated"] = now_utc
    meta["last_ai_run"] = now_utc
    meta["ai_run_summary"] = dict(result.summary)

    # 步骤 I：写回 + 校验
    _write_json(data_path, data)
    validate_ok, output = run_validate(repo_root)
    result.validate_ok = validate_ok
    if not validate_ok:
        # 校验失败：回滚到原始数据
        _write_json(data_path, original)
        result.rolled_back = True
        result.error = "validate 失败，已回滚。\n" + output
    return result


def main() -> int:
    """CLI 入口：构建真实客户端、运行、写日志/摘要、返回退出码。"""
    # 延迟导入：api_client / search_client 依赖 requests / python-dotenv
    from lib.api_client import build_client_from_env
    from lib.dates import utc_now_iso
    from lib.search_client import build_search_client_from_env

    client = build_client_from_env()
    search_client = build_search_client_from_env()
    result = run(DATA_PATH, REPO_ROOT, client, search_client)

    run_id = utc_now_iso().replace(":", "").replace("-", "")
    write_run_log(LOG_DIR, run_id, {"result": _result_to_log(result)})
    write_summary_md(
        LOG_DIR / "latest_run.md",
        result.summary,
        result.changed,
        result.validate_ok,
    )

    if result.error:
        print(result.error, file=sys.stderr)
    print(
        f"[update] archived={result.summary['archived']} "
        f"created={result.summary['created']} "
        f"queried={result.summary['queried']} "
        f"skipped={result.summary['skipped']} "
        f"updated={result.summary['updated']} "
        f"changed={result.changed} "
        f"validate_ok={result.validate_ok}"
    )
    return 0 if result.validate_ok and not result.error else 1


def _result_to_log(result: RunResult) -> dict:
    return {
        "summary": result.summary,
        "changed": result.changed,
        "validate_ok": result.validate_ok,
        "rolled_back": result.rolled_back,
        "error": result.error,
    }


if __name__ == "__main__":
    sys.exit(main())
