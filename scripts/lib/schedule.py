"""会议周期与下一届 upcoming 年份计算。

规则（见 .docs/01-requirements.md REQ-E02）：
- annual    -> last_known_year + 1
- biennial  -> last_known_year + 2
- irregular -> schedule.next_expected_year；未配置则不自动创建
- 无 schedule 时默认 annual
"""
from __future__ import annotations

from typing import Mapping

DEFAULT_FREQUENCY = "annual"
VALID_FREQUENCIES = {"annual", "biennial", "irregular"}


def get_frequency(conference: Mapping[str, object]) -> str:
    schedule = conference.get("schedule")
    if not isinstance(schedule, Mapping):
        return DEFAULT_FREQUENCY
    freq = schedule.get("frequency")
    if not isinstance(freq, str) or freq not in VALID_FREQUENCIES:
        return DEFAULT_FREQUENCY
    return freq


def last_known_year(conference: Mapping[str, object]) -> int | None:
    """会议已记录的最大年份；无任何年份时返回 None。"""
    years = conference.get("years")
    if not isinstance(years, list):
        return None
    known = [y.get("year") for y in years if isinstance(y, Mapping) and isinstance(y.get("year"), int)]
    if not known:
        return None
    return max(known)


def next_edition_year(conference: Mapping[str, object], last_known: int | None) -> int | None:
    """计算下一届 upcoming 的年份；无法确定时返回 None（跳过创建）。"""
    freq = get_frequency(conference)
    schedule = conference.get("schedule")

    if freq == "irregular":
        if isinstance(schedule, Mapping):
            ney = schedule.get("next_expected_year")
            if isinstance(ney, int):
                return ney
        return None

    # annual / biennial 需要基准年份
    if last_known is None:
        return None
    if freq == "annual":
        return last_known + 1
    if freq == "biennial":
        return last_known + 2
    return None
