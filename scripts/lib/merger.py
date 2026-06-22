"""AI 字段合并。

合并规则（见 .docs/01-requirements.md REQ-E02 步骤 G）：
- 只合并到对应 conference 的对应 upcoming year（由调用方保证定位）。
- 不改写 history 字段。
- 对 AI 返回的空值不覆盖已有非空值。
- upcoming 条目以 AI 新数据为准（非空新值覆盖旧值）。
- 返回是否产生了实际字段变更。
"""
from __future__ import annotations

from typing import Mapping, MutableMapping


def _is_empty(value: object) -> bool:
    if value is None:
        return True
    if isinstance(value, str) and value == "":
        return True
    if isinstance(value, (list, dict)) and len(value) == 0:
        return True
    return False


def merge_upcoming(entry: MutableMapping[str, object], ai_fields: Mapping[str, object]) -> bool:
    """将 AI 返回的字段合并进 upcoming entry，返回是否发生变更。

    - 跳过 AI 的空值（不覆盖已有非空值）。
    - 非空新值与旧值不同时覆盖（upcoming 以新数据为准）。
    - 不触碰 year / type / location_id（由脚本统一管理）。
    """
    managed = {"year", "type", "location_id"}
    changed = False
    for key, value in ai_fields.items():
        if key in managed:
            continue
        if _is_empty(value):
            continue
        existing = entry.get(key)
        if existing != value:
            entry[key] = value
            changed = True
    return changed
