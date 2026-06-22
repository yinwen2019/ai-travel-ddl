"""Prompt 构造。

针对单个 conference + 单个 upcoming year 构造 System / User prompt，
要求 AI 只返回该届会议的结构化 JSON（见 .docs/01-requirements.md REQ-E02 步骤 F）。
"""
from __future__ import annotations

import json
from typing import Mapping

SYSTEM_PROMPT = (
    "You are a precise assistant that returns ONLY a single valid JSON object "
    "about academic AI conferences.\n"
    "Hard rules:\n"
    "1. Return data ONLY for the requested conference and year. Ignore other years.\n"
    "2. Dates must be ISO 8601 YYYY-MM-DD.\n"
    "3. Timezones must be IANA identifiers, e.g. America/Los_Angeles (never PST).\n"
    "4. Country must be the full English name, e.g. United States (never USA).\n"
    "5. Continent must be one of: Asia, Europe, North America, South America, Africa, Oceania.\n"
    "6. If a field is uncertain, OMIT it entirely. Never fabricate or guess.\n"
    "7. Output a single JSON object with no markdown, no code fences, no commentary.\n"
    "8. You will be given trusted WEB SEARCH RESULTS as context. Extract event facts "
    "ONLY from those source snippets — do NOT rely on your own training data for "
    "specific dates, deadlines, venues, or URLs. If the trusted context does not "
    "explicitly mention an event fact, OMIT it.\n"
    "9. Never use conference aggregator or fake-conference sites such as WASET, "
    "WikiCFP, 10times, Conference Alerts, ConferenceIndex, or Resurchify.\n"
    "10. If a trusted source explicitly gives a city but omits country/continent, "
    "you may fill country and continent only when they are geographically unambiguous. "
    "Use project country naming: Hong Kong and Macao are China, continent Asia.\n"
    "Allowed keys: city, country, continent, venue, url, start_date, end_date, "
    "notification_date, camera_ready, abstract_ddl, paper_ddl. "
    "abstract_ddl and paper_ddl are arrays of {date, timezone, note?}."
)


def _known_partial(entry: Mapping[str, object]) -> dict[str, object]:
    """提取该届已有的非空字段，供 AI 参考（避免覆盖已知正确信息）。"""
    keys = (
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
    )
    partial: dict[str, object] = {}
    for k in keys:
        v = entry.get(k)
        if v:
            partial[k] = v
    return partial


def build_prompt(
    conference: Mapping[str, object],
    entry: Mapping[str, object],
    search_context: str = "",
    trusted_domains: set[str] | None = None,
) -> tuple[str, str]:
    """构造 (system, user) prompt。entry 为目标 upcoming 年份条目。

    search_context 非空时，将其作为「仅可依据的事实来源」注入 user prompt（搜索接地）。
    """
    name = conference.get("name")
    full_name = conference.get("full_name")
    conf_id = conference.get("id")
    website = conference.get("website")
    aka = conference.get("aka")
    year = entry.get("year")

    lines = [
        f"Conference: {name} ({full_name})",
        f"Conference id: {conf_id}",
    ]
    if isinstance(aka, list) and aka:
        lines.append(f"Also known as: {', '.join(str(a) for a in aka)}")
    if isinstance(website, str) and website:
        lines.append(f"Official website: {website}")
    if trusted_domains:
        lines.append(f"Trusted source domains: {', '.join(sorted(trusted_domains))}")
    partial = _known_partial(entry)
    if partial:
        lines.append(f"Already known for {year} (do not remove these): {json.dumps(partial, ensure_ascii=False)}")
    if search_context:
        lines.append("")
        lines.append("## Web search results (use ONLY these as the source of facts)")
        lines.append(search_context)
    lines.append("")
    lines.append(
        f"Return a JSON object for {name} {year} with whichever of these keys you can "
        "verify from the trusted search results above: city, country, continent, venue, url, "
        "start_date, end_date, notification_date, camera_ready, abstract_ddl, paper_ddl. "
        "For city/venue/dates, the exact fact must be present in the trusted source "
        "snippets. For country/continent, infer only from a trusted city when the "
        "mapping is unambiguous; otherwise omit. Omit any key the trusted search "
        "results do not support. "
        "Output JSON only."
    )
    return SYSTEM_PROMPT, "\n".join(lines)
