"""AI 响应解析 + 字段校验。

将 AI 返回的原始文本解析为「仅含合法非空字段」的字典，供 merger 合并。
- 容忍 ```json 代码块包裹与多余文本。
- 日期须 ISO 8601，时区须 IANA，continent 须合法枚举。
- url 须以 http 开头。
- 任何非法或空值字段一律剔除，不传入合并阶段。
"""
from __future__ import annotations

import json
import re
from typing import Mapping

from .completeness import TZ_RE, VALID_CONTINENTS
from .dates import is_valid_date

ALLOWED_FIELDS = {
    "city",
    "country",
    "continent",
    "venue",
    "url",
    "start_date",
    "end_date",
    "notification_date",
    "camera_ready",
    "abstract_ddl",
    "paper_ddl",
}

_JSON_FENCE_RE = re.compile(r"```(?:json)?\s*(.*?)```", re.DOTALL)


def _extract_json(raw: str) -> object | None:
    """从原始文本中提取首个 JSON 对象；失败返回 None。"""
    text = raw.strip()
    # 直接解析
    try:
        return json.loads(text)
    except (json.JSONDecodeError, ValueError):
        pass
    # 去除 ```json ... ``` 围栏后重试
    m = _JSON_FENCE_RE.search(text)
    if m:
        try:
            return json.loads(m.group(1).strip())
        except (json.JSONDecodeError, ValueError):
            pass
    # 截取首个 {...} 平衡片段
    start = text.find("{")
    if start == -1:
        return None
    depth = 0
    for i in range(start, len(text)):
        ch = text[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                try:
                    return json.loads(text[start : i + 1])
                except (json.JSONDecodeError, ValueError):
                    return None
    return None


def _clean_ddl(ddl: object) -> list[dict[str, str]] | None:
    """清洗 DDL 列表：只保留 date+timezone 合法的 entry；全空则返回 None。"""
    if not isinstance(ddl, list):
        return None
    cleaned: list[dict[str, str]] = []
    for item in ddl:
        if not isinstance(item, Mapping):
            continue
        date = item.get("date")
        tz = item.get("timezone")
        if not is_valid_date(date):
            continue
        if not isinstance(tz, str) or not TZ_RE.match(tz):
            continue
        assert isinstance(date, str)
        entry: dict[str, str] = {"date": date, "timezone": tz}
        note = item.get("note")
        if isinstance(note, str) and note.strip():
            entry["note"] = note.strip()
        cleaned.append(entry)
    return cleaned if cleaned else None


def parse_ai_response(raw: str | None) -> dict[str, object]:
    """解析 AI 原始响应，返回仅含合法非空字段的字典。"""
    if not raw:
        return {}
    obj = _extract_json(raw)
    if not isinstance(obj, Mapping):
        return {}

    out: dict[str, object] = {}

    for key in ("city", "country", "venue"):
        v = obj.get(key)
        if isinstance(v, str) and v.strip():
            out[key] = v.strip()

    continent = obj.get("continent")
    if isinstance(continent, str) and continent in VALID_CONTINENTS:
        out["continent"] = continent

    url = obj.get("url")
    if isinstance(url, str) and url.startswith("http"):
        out["url"] = url

    for key in ("start_date", "end_date", "notification_date", "camera_ready"):
        v = obj.get(key)
        if is_valid_date(v):
            assert isinstance(v, str)
            out[key] = v

    for key in ("abstract_ddl", "paper_ddl"):
        cleaned = _clean_ddl(obj.get(key))
        if cleaned:
            out[key] = cleaned

    # 仅保留白名单字段，防御 AI 返回多余键
    return {k: v for k, v in out.items() if k in ALLOWED_FIELDS}
