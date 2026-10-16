"""与 JSON Schema 共用格式规则，并校验 IANA 时区是否存在。"""
from __future__ import annotations

import json
import re
from pathlib import Path
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

_SCHEMA_PATH = Path(__file__).resolve().parents[2] / "data" / "schema.json"
_SCHEMA = json.loads(_SCHEMA_PATH.read_text(encoding="utf-8"))
TZ_RE = re.compile(_SCHEMA["definitions"]["ddlEntry"]["properties"]["timezone"]["pattern"])


def is_valid_timezone(value: object) -> bool:
    """Accept existing IANA zone IDs with an area/name structure, not abbreviations."""
    if not isinstance(value, str) or not TZ_RE.fullmatch(value):
        return False
    try:
        ZoneInfo(value)
    except (ZoneInfoNotFoundError, ValueError):
        return False
    return True
