"""日期与时间工具。

约定：所有日期为 ISO 8601 `YYYY-MM-DD`，时间戳为 `YYYY-MM-DDTHH:MM:SSZ`（UTC）。
ISO 日期字符串可按字典序直接比较，等价于按时间先后比较。
"""
from __future__ import annotations

import datetime as _dt
import re

DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")


def today_iso() -> str:
    """当前 UTC 日期，ISO 8601 `YYYY-MM-DD`。"""
    return _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%d")


def utc_now_iso() -> str:
    """当前 UTC 时间戳，ISO 8601 `YYYY-MM-DDTHH:MM:SSZ`。"""
    return _dt.datetime.now(_dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def is_valid_date(value: object) -> bool:
    """判断是否为合法的 ISO 8601 日期字符串。"""
    return isinstance(value, str) and bool(DATE_RE.match(value))
