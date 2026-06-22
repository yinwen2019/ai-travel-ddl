"""active upcoming 判定与关键字段完整性判定。

核心规则（见 .docs/01-requirements.md REQ-E02）：
- “过期”指会议 end_date 已早于 today，不是 DDL 截止。
- end_date 缺失或格式非法的 upcoming 视为未结束（active）。
- 是否查询 AI 仅由关键字段完整性决定。
"""
from __future__ import annotations

import re
from typing import Mapping

from .dates import is_valid_date

VALID_CONTINENTS = {
    "Asia",
    "Europe",
    "North America",
    "South America",
    "Africa",
    "Oceania",
}

# IANA 时区，形如 America/Los_Angeles
TZ_RE = re.compile(r"^[A-Za-z][A-Za-z0-9_+-]+/[A-Za-z][A-Za-z0-9_+-]+$")


def is_ended(entry: Mapping[str, object], today: str) -> bool:
    """upcoming 是否已结束：type=upcoming 且 end_date 为合法日期且 end_date < today。"""
    if entry.get("type") != "upcoming":
        return False
    end = entry.get("end_date")
    if not is_valid_date(end):
        return False
    assert isinstance(end, str)  # is_valid_date 已保证
    return end < today


def is_active_upcoming(entry: Mapping[str, object], today: str) -> bool:
    """是否为 active upcoming：type=upcoming 且尚未结束。"""
    if entry.get("type") != "upcoming":
        return False
    return not is_ended(entry, today)


def _ddl_entries_complete(ddl: object) -> bool:
    """DDL 列表中每个 entry 都有合法 date + IANA timezone。空列表视为不完整。"""
    if not isinstance(ddl, list) or len(ddl) == 0:
        return False
    for item in ddl:
        if not isinstance(item, Mapping):
            return False
        if not is_valid_date(item.get("date")):
            return False
        tz = item.get("timezone")
        if not isinstance(tz, str) or not TZ_RE.match(tz):
            return False
    return True


def is_key_fields_complete(entry: Mapping[str, object], conference: Mapping[str, object]) -> bool:
    """判断 upcoming 关键字段是否完整。

    完整定义：
    - city / country / continent 均存在（continent 须为合法枚举）
    - start_date / end_date 均存在
    - url 或 conference.website 至少存在一个
    - 至少存在一个非空 paper_ddl 或 abstract_ddl
    - 每个非空 DDL 列表中的 entry 都有 date + timezone
    """
    if not entry.get("city") or not isinstance(entry.get("city"), str):
        return False
    if not entry.get("country") or not isinstance(entry.get("country"), str):
        return False
    if entry.get("continent") not in VALID_CONTINENTS:
        return False
    if not is_valid_date(entry.get("start_date")):
        return False
    if not is_valid_date(entry.get("end_date")):
        return False
    url = entry.get("url")
    if not url:
        url = conference.get("website")
    if not isinstance(url, str) or not url:
        return False

    has_ddl = False
    for key in ("abstract_ddl", "paper_ddl"):
        ddl = entry.get(key)
        if ddl:
            has_ddl = True
            if not _ddl_entries_complete(ddl):
                return False
    if not has_ddl:
        return False
    return True
