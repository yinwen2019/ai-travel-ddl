"""基于本地历史数据的地点字段补全。"""
from __future__ import annotations

from typing import Mapping


LocationInfo = dict[str, str]


STATIC_CITY_LOCATIONS: dict[str, LocationInfo] = {
    "hong kong": {"country": "China", "continent": "Asia"},
    "macao": {"country": "China", "continent": "Asia"},
}


def _city_key(city: object) -> str:
    if not isinstance(city, str):
        return ""
    return " ".join(city.strip().lower().split())


def build_location_index(conferences: list[Mapping[str, object]]) -> dict[str, LocationInfo]:
    """从本地数据构建 city -> country/continent 索引。

    若同名城市在数据中出现冲突，保留静态表或首次一致记录，避免覆盖。
    """
    index: dict[str, LocationInfo] = dict(STATIC_CITY_LOCATIONS)
    conflicts: set[str] = set()

    for conf in conferences:
        years = conf.get("years")
        if not isinstance(years, list):
            continue
        for entry in years:
            if not isinstance(entry, Mapping):
                continue
            key = _city_key(entry.get("city"))
            country = entry.get("country")
            continent = entry.get("continent")
            if not key or not isinstance(country, str) or not isinstance(continent, str):
                continue
            if key in conflicts:
                continue
            info = {"country": country, "continent": continent}
            if key in index and index[key] != info:
                # 静态表优先；普通同名冲突不再自动补全。
                if key not in STATIC_CITY_LOCATIONS:
                    index.pop(key, None)
                    conflicts.add(key)
                continue
            index[key] = info
    return index


def infer_location_fields(
    fields: dict[str, object],
    location_index: Mapping[str, LocationInfo],
) -> dict[str, object]:
    """根据已可信抽取的 city 补全 country/continent。"""
    city_key = _city_key(fields.get("city"))
    if not city_key:
        return fields
    info = location_index.get(city_key)
    if not info:
        return fields

    enriched = dict(fields)
    if not enriched.get("country"):
        enriched["country"] = info["country"]
    if not enriched.get("continent"):
        enriched["continent"] = info["continent"]
    return enriched
