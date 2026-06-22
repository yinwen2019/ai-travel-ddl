"""JSON Lines 运行日志 + Markdown 摘要。

- JSONL 日志：每次运行追加一行事件到 scripts/update_logs/。
- Markdown 摘要：写入 scripts/update_logs/latest_run.md，供 GitHub Actions PR body 引用。

update_logs/ 已加入 .gitignore，不会产生 git diff。
"""
from __future__ import annotations

import json
from pathlib import Path
from typing import Mapping


def _ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def write_run_log(log_dir: Path, run_id: str, payload: Mapping[str, object]) -> None:
    """追加一行 JSON 事件到 update_logs/<run_id>.jsonl。"""
    _ensure_dir(log_dir)
    target = log_dir / f"{run_id}.jsonl"
    with target.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(payload, ensure_ascii=False) + "\n")


def write_summary_md(
    path: Path,
    summary: Mapping[str, int],
    changed: bool,
    validate_ok: bool,
) -> None:
    """写入 Markdown 摘要，供 PR body 使用。"""
    _ensure_dir(path.parent)
    lines = [
        "# AI 数据更新运行摘要",
        "",
        f"- 归档 upcoming（ended -> history）: {summary.get('archived', 0)}",
        f"- 创建 upcoming（占位）: {summary.get('created', 0)}",
        f"- 查询 upcoming（联网）: {summary.get('queried', 0)}",
        f"- 跳过 upcoming（关键字段完整）: {summary.get('skipped', 0)}",
        f"- 更新 upcoming（字段合并）: {summary.get('updated', 0)}",
        "",
        f"- 是否产生数据变更: {'是' if changed else '否'}",
        f"- `npm run validate`: {'通过' if validate_ok else '失败（已回滚）'}",
        "",
        "> 由 `scripts/update_conferences.py` 自动生成。无数据变更时不会创建 PR。",
    ]
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
