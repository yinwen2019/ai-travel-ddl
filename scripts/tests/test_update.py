"""REQ-E02 核心逻辑测试。

覆盖：
- end_date < today 的 upcoming 转 history（且保留 DDL）
- end_date 缺失的 upcoming 不转 history
- annual / biennial / irregular 的下一届创建规则
- 关键字段完整的 upcoming 不查询 AI
- 关键字段不完整的 upcoming 查询 AI
- 无数据变更时不写文件（对应 workflow 无 diff 不创建 PR）
- 合并规则（空值不覆盖、新值覆盖）
- validate 失败回滚

测试通过依赖注入 FakeClient + monkeypatch run_validate，无需真实 API Key / npm。
"""
from __future__ import annotations

import json
from pathlib import Path

import pytest

import update_conferences as uc
from lib.merger import merge_upcoming
from lib.search_client import _format_context

TODAY = "2026-06-22"
NOW_UTC = "2026-06-22T00:00:00Z"


class FakeClient:
    """记录调用并按预设响应序列返回的假 AI 客户端。"""

    def __init__(self, responses: list[str] | None = None) -> None:
        self.calls: list[tuple[str, str]] = []
        self._responses = list(responses) if responses else []

    def query(self, system: str, user: str) -> str:
        self.calls.append((system, user))
        if self._responses:
            return self._responses.pop(0)
        return ""


class FakeSearch:
    """记录调用并返回预设上下文的假搜索客户端。"""

    def __init__(self, context: str = "") -> None:
        self.calls: list[str] = []
        self.trusted_domains_calls: list[set[str] | None] = []
        self._context = context

    def search(
        self,
        query: str,
        max_results: int = 5,
        trusted_domains: set[str] | None = None,
    ) -> str:
        self.calls.append(query)
        self.trusted_domains_calls.append(trusted_domains)
        return self._context


# --------------- fixture 构造 ---------------

def make_meta() -> dict:
    return {
        "version": "0.2.0",
        "last_updated": "2026-01-01T00:00:00Z",
        "description": "test",
        "data_source": "test",
    }


def make_conf(
    conf_id: str = "neurips",
    years: list | None = None,
    schedule: dict | None = None,
    website: str = "https://example.com",
    category: str = "ML",
) -> dict:
    conf: dict = {
        "id": conf_id,
        "name": conf_id.upper(),
        "full_name": "Test Conference",
        "category": category,
        "website": website,
        "years": years or [],
    }
    if schedule:
        conf["schedule"] = schedule
    return conf


def make_data(conferences: list) -> dict:
    return {"meta": make_meta(), "conferences": conferences}


def complete_upcoming(year: int = 2027) -> dict:
    """关键字段完整的 active upcoming。"""
    return {
        "year": year,
        "type": "upcoming",
        "city": "Sydney",
        "country": "Australia",
        "continent": "Oceania",
        "url": f"https://example.com/{year}",
        "start_date": f"{year}-12-06",
        "end_date": f"{year}-12-12",
        "abstract_ddl": [{"date": f"{year}-05-04", "timezone": "America/Los_Angeles"}],
        "paper_ddl": [{"date": f"{year}-05-06", "timezone": "America/Los_Angeles"}],
    }


def placeholder_upcoming(year: int = 2027) -> dict:
    """占位 active upcoming：字段存在，但值为 null/空数组。"""
    return {
        "year": year,
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


def history(year: int = 2025) -> dict:
    return {
        "year": year,
        "type": "history",
        "city": "Vancouver",
        "country": "Canada",
        "continent": "North America",
    }


def ended_upcoming(year: int = 2025) -> dict:
    """已结束的 upcoming（end_date < today）。"""
    return {
        "year": year,
        "type": "upcoming",
        "city": "Paris",
        "country": "France",
        "continent": "Europe",
        "start_date": f"{year}-12-01",
        "end_date": f"{year}-12-05",
        "paper_ddl": [{"date": f"{year}-05-06", "timezone": "Europe/Paris", "note": "Full paper"}],
    }


def write_data(tmp_path: Path, data: dict) -> Path:
    p = tmp_path / "conferences.json"
    p.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    return p


def run_with(
    data: dict,
    tmp_path: Path,
    client: FakeClient,
    monkeypatch,
    search: FakeSearch | None = None,
) -> tuple[uc.RunResult, dict]:
    """写数据 -> 运行 -> 读回。run_validate 桩为通过。"""
    monkeypatch.setattr(uc, "run_validate", lambda root: (True, ""))
    p = write_data(tmp_path, data)
    if search is None:
        search = FakeSearch()  # 默认返回空上下文，不影响已有断言
    res = uc.run(
        data_path=p,
        repo_root=tmp_path,
        client=client,
        search_client=search,
        today=TODAY,
        now_utc=NOW_UTC,
    )
    return res, json.loads(p.read_text(encoding="utf-8"))


# --------------- 归档 ---------------

def test_archive_ended_upcoming(tmp_path, monkeypatch):
    """end_date < today 的 upcoming 转为 history。"""
    data = make_data([make_conf(years=[ended_upcoming(2025), complete_upcoming(2027)])])
    res, out = run_with(data, tmp_path, FakeClient(), monkeypatch)
    e2025 = next(y for y in out["conferences"][0]["years"] if y["year"] == 2025)
    assert e2025["type"] == "history"
    assert res.summary["archived"] == 1
    assert res.changed


def test_archive_preserves_ddl(tmp_path, monkeypatch):
    """归档不删除 DDL 等原始字段。"""
    data = make_data([make_conf(years=[ended_upcoming(2025), complete_upcoming(2027)])])
    res, out = run_with(data, tmp_path, FakeClient(), monkeypatch)
    e2025 = next(y for y in out["conferences"][0]["years"] if y["year"] == 2025)
    assert e2025["type"] == "history"
    assert e2025["paper_ddl"] == [
        {"date": "2025-05-06", "timezone": "Europe/Paris", "note": "Full paper"}
    ]


def test_end_date_missing_not_archived(tmp_path, monkeypatch):
    """end_date 缺失的 upcoming 不转 history。"""
    data = make_data([make_conf(years=[placeholder_upcoming(2027)])])
    res, out = run_with(data, tmp_path, FakeClient(), monkeypatch)
    e = out["conferences"][0]["years"][0]
    assert e["type"] == "upcoming"
    assert res.summary["archived"] == 0


def test_ddl_expired_but_not_ended_stays_upcoming(tmp_path, monkeypatch):
    """DDL 已截止但会议未结束（end_date >= today）仍保持 upcoming（Travel 状态）。"""
    entry = complete_upcoming(2027)
    # DDL 在过去，但 end_date 在未来
    entry["paper_ddl"] = [{"date": "2026-01-01", "timezone": "America/Los_Angeles"}]
    entry["abstract_ddl"] = [{"date": "2025-12-01", "timezone": "America/Los_Angeles"}]
    data = make_data([make_conf(years=[entry])])
    res, out = run_with(data, tmp_path, FakeClient(), monkeypatch)
    e = out["conferences"][0]["years"][0]
    assert e["type"] == "upcoming"
    assert res.summary["archived"] == 0


# --------------- 下一届创建 ---------------

def test_annual_creates_last_plus_one(tmp_path, monkeypatch):
    """annual 无 active upcoming 时创建 last_known_year + 1。"""
    data = make_data([make_conf(years=[history(2025)], schedule={"frequency": "annual"})])
    res, out = run_with(data, tmp_path, FakeClient(), monkeypatch)
    new = next(y for y in out["conferences"][0]["years"] if y["year"] == 2026)
    assert new["type"] == "upcoming"
    assert new["city"] is None  # 不写假地点，但保留前端读取字段
    assert new["country"] is None
    assert new["continent"] is None
    assert new["abstract_ddl"] == []
    assert new["paper_ddl"] == []
    assert new["start_date"] is None
    assert new["end_date"] is None
    assert res.summary["created"] == 1


def test_biennial_creates_last_plus_two(tmp_path, monkeypatch):
    """biennial 无 active upcoming 时创建 last_known_year + 2。"""
    data = make_data([make_conf(years=[history(2025)], schedule={"frequency": "biennial"})])
    res, out = run_with(data, tmp_path, FakeClient(), monkeypatch)
    years = {y["year"] for y in out["conferences"][0]["years"]}
    assert 2027 in years  # 2025 + 2
    assert 2026 not in years
    assert res.summary["created"] == 1


def test_irregular_without_next_expected_skips(tmp_path, monkeypatch):
    """irregular 未配置 next_expected_year 时不创建。"""
    data = make_data([make_conf(years=[history(2025)], schedule={"frequency": "irregular"})])
    res, out = run_with(data, tmp_path, FakeClient(), monkeypatch)
    years = {y["year"] for y in out["conferences"][0]["years"]}
    assert years == {2025}
    assert res.summary["created"] == 0
    assert not res.changed


def test_irregular_with_next_expected_creates(tmp_path, monkeypatch):
    """irregular 配置 next_expected_year 时创建该年份。"""
    data = make_data(
        [
            make_conf(
                years=[history(2025)],
                schedule={"frequency": "irregular", "next_expected_year": 2028},
            )
        ]
    )
    res, out = run_with(data, tmp_path, FakeClient(), monkeypatch)
    new = next(y for y in out["conferences"][0]["years"] if y["year"] == 2028)
    assert new["type"] == "upcoming"
    assert res.summary["created"] == 1


def test_no_schedule_defaults_annual(tmp_path, monkeypatch):
    """无 schedule 时默认 annual。"""
    data = make_data([make_conf(years=[history(2025)])])
    res, out = run_with(data, tmp_path, FakeClient(), monkeypatch)
    assert res.summary["created"] == 1
    assert 2026 in {y["year"] for y in out["conferences"][0]["years"]}


def test_does_not_create_when_active_upcoming_exists(tmp_path, monkeypatch):
    """已有 active upcoming 时不创建新占位。"""
    data = make_data(
        [make_conf(years=[history(2025), placeholder_upcoming(2027)], schedule={"frequency": "annual"})]
    )
    res, out = run_with(data, tmp_path, FakeClient(), monkeypatch)
    assert res.summary["created"] == 0
    assert {y["year"] for y in out["conferences"][0]["years"]} == {2025, 2027}


# --------------- 查询决策 ---------------

def test_complete_upcoming_not_queried(tmp_path, monkeypatch):
    """关键字段完整的 upcoming 不调用 AI。"""
    data = make_data([make_conf(years=[complete_upcoming(2027)])])
    client = FakeClient()
    res, _ = run_with(data, tmp_path, client, monkeypatch)
    assert len(client.calls) == 0
    assert res.summary["queried"] == 0
    assert res.summary["skipped"] == 1
    assert not res.changed


def test_incomplete_upcoming_queried(tmp_path, monkeypatch):
    """关键字段不完整的 upcoming 调用 AI。"""
    data = make_data([make_conf(years=[placeholder_upcoming(2027)])])
    client = FakeClient()
    res, _ = run_with(data, tmp_path, client, monkeypatch)
    assert len(client.calls) == 1
    assert res.summary["queried"] == 1
    assert res.summary["skipped"] == 0


def test_no_change_does_not_write_file(tmp_path, monkeypatch):
    """无数据变更时不写文件（对应 workflow 无 diff 不创建 PR）。"""
    monkeypatch.setattr(uc, "run_validate", lambda root: (True, ""))
    data = make_data([make_conf(years=[complete_upcoming(2027)])])
    p = write_data(tmp_path, data)
    before = p.read_text(encoding="utf-8")
    client = FakeClient()
    res = uc.run(data_path=p, repo_root=tmp_path, client=client, today=TODAY, now_utc=NOW_UTC)
    assert not res.changed
    assert p.read_text(encoding="utf-8") == before  # 文件未被改写


# --------------- 搜索接地 ---------------

def test_grounded_flow_searches_then_queries(tmp_path, monkeypatch):
    """搜索接地：先搜索拿真实上下文，再调 LLM 基于上下文抽取，最后合并。"""
    entry = placeholder_upcoming(2027)
    data = make_data([make_conf(conf_id="neurips", years=[entry], website="https://neurips.cc")])
    context = (
        "## 搜索摘要\nNeurIPS 2027 will be held in Los Angeles, United States, "
        "Dec 5-11 2027. Submission deadline May 7 2027, timezone America/Los_Angeles.\n"
        "## [1] NeurIPS 2027\nURL: https://neurips.cc/Conferences/2027\n"
        "NeurIPS 2027: Los Angeles, USA. Dates Dec 5-11 2027. Deadline May 7 2027."
    )
    search = FakeSearch(context=context)
    full = json.dumps(
        {
            "city": "Los Angeles",
            "country": "United States",
            "continent": "North America",
            "url": "https://neurips.cc/Conferences/2027",
            "start_date": "2027-12-05",
            "end_date": "2027-12-11",
            "paper_ddl": [{"date": "2027-05-07", "timezone": "America/Los_Angeles"}],
        }
    )
    client = FakeClient(responses=[full])
    res, out = run_with(data, tmp_path, client, monkeypatch, search=search)

    assert len(search.calls) == 1  # 先搜索
    assert "2027" in search.calls[0] and "neurips" in search.calls[0].lower()
    assert search.trusted_domains_calls[0] == {"neurips.cc"}
    assert len(client.calls) == 1  # 再查 LLM
    assert "Los Angeles" in client.calls[0][1]  # 上下文已注入 user prompt
    assert "Trusted source domains: neurips.cc" in client.calls[0][1]
    e = out["conferences"][0]["years"][0]
    assert e["city"] == "Los Angeles"
    assert e["start_date"] == "2027-12-05"
    assert res.summary["queried"] == 1


def test_ai_location_without_context_support_is_dropped(tmp_path, monkeypatch):
    """AI 返回的地点若不在可信上下文中，不合并，避免把猜测写入数据。"""
    entry = placeholder_upcoming(2027)
    data = make_data([make_conf(conf_id="iccv", years=[entry], website="https://iccv.thecvf.com")])
    context = (
        "## [1] ICCV 2027\n"
        "URL: https://iccv.thecvf.com\n"
        "ICCV 2027 official site. Future announcements will be posted here."
    )
    ai = json.dumps(
        {
            "city": "Dubai",
            "country": "United Arab Emirates",
            "continent": "Asia",
            "url": "https://iccv.thecvf.com",
        }
    )
    res, out = run_with(data, tmp_path, FakeClient(responses=[ai]), monkeypatch, search=FakeSearch(context))
    e = out["conferences"][0]["years"][0]
    assert e["city"] is None
    assert e["country"] is None
    assert e["continent"] is None
    assert e["url"] == "https://iccv.thecvf.com"
    assert res.summary["updated"] == 1


def test_known_city_infers_country_and_continent(tmp_path, monkeypatch):
    """可信来源只给 city 时，从本地历史地点索引补全 country/continent。"""
    entry = placeholder_upcoming(2027)
    history_hong_kong = {
        "year": 2019,
        "type": "history",
        "city": "Hong Kong",
        "country": "China",
        "continent": "Asia",
    }
    data = make_data(
        [
            make_conf(
                conf_id="iccv",
                years=[history_hong_kong, entry],
                website="https://iccv.thecvf.com",
            )
        ]
    )
    context = (
        "## [1] ICCV 2027\n"
        "URL: https://iccv.thecvf.com\n"
        "ICCV 2027 will take place in Hong Kong from Oct 2 to Oct 8, 2027."
    )
    ai = json.dumps(
        {
            "city": "Hong Kong",
            "start_date": "2027-10-02",
            "end_date": "2027-10-08",
        }
    )
    res, out = run_with(data, tmp_path, FakeClient(responses=[ai]), monkeypatch, search=FakeSearch(context))
    e = next(y for y in out["conferences"][0]["years"] if y["year"] == 2027)
    assert e["city"] == "Hong Kong"
    assert e["country"] == "China"
    assert e["continent"] == "Asia"
    assert e["start_date"] == "2027-10-02"
    assert res.summary["updated"] == 1
    assert res.summary["updated"] == 1


def test_empty_search_context_omits_block(tmp_path, monkeypatch):
    """搜索返回空时，prompt 不包含搜索结果块（退化为裸模型查询）。"""
    entry = placeholder_upcoming(2027)
    data = make_data([make_conf(years=[entry])])
    search = FakeSearch(context="")
    client = FakeClient()
    res, _ = run_with(data, tmp_path, client, monkeypatch, search=search)
    assert "Web search results" not in client.calls[0][1]
    assert res.summary["queried"] == 1


def test_prompt_allows_unambiguous_country_continent_inference(tmp_path, monkeypatch):
    """Prompt 允许从可信城市补全明确国家/洲。"""
    entry = placeholder_upcoming(2027)
    data = make_data([make_conf(conf_id="iccv", years=[entry], website="https://iccv.thecvf.com")])
    context = "## [1] ICCV 2027\nURL: https://iccv.thecvf.com\nICCV 2027 will be held in Hong Kong."
    client = FakeClient()
    res, _ = run_with(data, tmp_path, client, monkeypatch, search=FakeSearch(context))
    system, user = client.calls[0]
    assert "Hong Kong and Macao are China" in system
    assert "infer only from a trusted city when the mapping is unambiguous" in user
    assert res.summary["queried"] == 1


def test_search_context_filters_untrusted_domains():
    """搜索上下文过滤非可信/聚合站结果。"""
    data = {
        "results": [
            {
                "title": "Fake ICCV 2027",
                "url": "https://waset.org/iccv-2027-dubai",
                "content": "ICCV 2027 Dubai",
            },
            {
                "title": "ICCV official",
                "url": "https://iccv.thecvf.com",
                "content": "ICCV official announcements",
            },
        ]
    }
    context = _format_context(data, trusted_domains={"iccv.thecvf.com", "thecvf.com"})
    assert "waset" not in context.lower()
    assert "Dubai" not in context
    assert "iccv.thecvf.com" in context


# --------------- 合并规则 ---------------

def test_merge_empty_does_not_overwrite():
    """AI 空值不覆盖已有非空值。"""
    entry = {"city": "Sydney", "paper_ddl": [{"date": "2027-05-06", "timezone": "America/Los_Angeles"}]}
    changed = merge_upcoming(entry, {"city": "", "country": "Australia"})
    assert entry["city"] == "Sydney"
    assert entry["country"] == "Australia"
    assert changed


def test_merge_new_value_wins():
    """AI 非空新值覆盖旧值（upcoming 以新数据为准）。"""
    entry = {"city": "Sydney"}
    changed = merge_upcoming(entry, {"city": "Melbourne"})
    assert entry["city"] == "Melbourne"
    assert changed


def test_merge_no_change_when_same():
    """AI 值与已有相同时不算变更。"""
    entry = {"city": "Sydney"}
    changed = merge_upcoming(entry, {"city": "Sydney"})
    assert not changed


def test_merge_ignores_managed_fields():
    """合并不触碰 year/type/location_id。"""
    entry = {"year": 2027, "type": "upcoming", "location_id": "old"}
    changed = merge_upcoming(
        entry,
        {"year": 9999, "type": "history", "location_id": "new", "city": "Sydney"},
    )
    assert entry["year"] == 2027
    assert entry["type"] == "upcoming"
    assert entry["location_id"] == "old"
    assert entry["city"] == "Sydney"
    assert changed  # city 变更


def test_query_partial_merge_keeps_missing_fields(tmp_path, monkeypatch):
    """查询后仍不完整时，已知字段更新，缺失字段继续保留 null/空数组。"""
    entry = placeholder_upcoming(2027)
    data = make_data([make_conf(years=[entry])])
    partial = json.dumps({"city": "Sydney"})  # 仅 city，仍不完整
    search = FakeSearch(
        "## [1] Test Conference\n"
        "URL: https://example.com/2027\n"
        "Test Conference 2027 will be held in Sydney."
    )
    res, out = run_with(data, tmp_path, FakeClient(responses=[partial]), monkeypatch, search=search)
    e = out["conferences"][0]["years"][0]
    assert e["city"] == "Sydney"
    assert e["country"] is None
    assert e["abstract_ddl"] == []
    assert res.summary["updated"] == 1


# --------------- 回滚 ---------------

def test_rollback_on_validate_failure(tmp_path, monkeypatch):
    """validate 失败时回滚到原始数据。"""
    monkeypatch.setattr(uc, "run_validate", lambda root: (False, "forced failure"))
    data = make_data([make_conf(years=[history(2025)], schedule={"frequency": "annual"})])
    p = write_data(tmp_path, data)
    client = FakeClient()
    res = uc.run(data_path=p, repo_root=tmp_path, client=client, today=TODAY, now_utc=NOW_UTC)
    assert res.rolled_back
    assert not res.validate_ok
    out = json.loads(p.read_text(encoding="utf-8"))
    assert out == data  # 回滚后与原始一致
    # 创建的 2026 占位被回滚掉
    assert {y["year"] for y in out["conferences"][0]["years"]} == {2025}


# --------------- meta ---------------

def test_meta_updated_only_when_changed(tmp_path, monkeypatch):
    """有数据变更时更新 meta.last_updated / last_ai_run / ai_run_summary。"""
    data = make_data([make_conf(years=[history(2025)], schedule={"frequency": "annual"})])
    res, out = run_with(data, tmp_path, FakeClient(), monkeypatch)
    meta = out["meta"]
    assert meta["last_updated"] == NOW_UTC
    assert meta["last_ai_run"] == NOW_UTC
    assert meta["ai_run_summary"] == res.summary
