"""REQ-E02：真实差异、中文评审摘要、模型失败降级与 CLI 集成。"""
from __future__ import annotations

import copy
import json

import pytest

import update_conferences as uc
from lib.logger import write_summary_md
from lib.review_report import (
    build_pr_title, collect_changes, generate_ai_overview, render_review_report,
)
from test_update import (
    FakeClient, FakeSearch, complete_upcoming, make_conf, make_data, write_data,
)


def sample_diff():
    before = make_data([make_conf(years=[complete_upcoming()])])
    after = copy.deepcopy(before)
    entry = after["conferences"][0]["years"][0]
    entry["city"] = "Paris"
    entry["paper_ddl"] = [{"date": "2026-10-12", "timezone": "Etc/GMT+12", "note": "ARR | full paper"}]
    after["meta"]["last_updated"] = "2026-10-16T00:00:00Z"
    return before, after


def overview(changes):
    return {"overview": "更新了会议地点和投稿截止信息。", "items": [
        {"id": c["id"], "summary": "修改举办城市及论文截止信息，请核对投稿批次。"} for c in changes
    ]}


def test_diff_uses_stable_ids_and_ignores_metadata_and_order():
    before, after = sample_diff()
    before_copy, after_copy = copy.deepcopy(before), copy.deepcopy(after)
    changes = collect_changes(before, after)
    assert len(changes) == 1
    assert changes[0]["id"] == "neurips:2027"
    assert {f["field"] for f in changes[0]["fields"]} == {"city", "paper_ddl"}
    assert before == before_copy and after == after_copy
    after = copy.deepcopy(before)
    after["conferences"].append(make_conf(conf_id="other", years=[complete_upcoming(2028)]))
    before = copy.deepcopy(after)
    after["meta"]["last_updated"] = "2026-10-16T00:00:00Z"
    after["conferences"].reverse()
    assert collect_changes(before, after) == []


def test_created_archived_and_removed_editions():
    before = make_data([make_conf(years=[complete_upcoming(2026)])])
    after = copy.deepcopy(before)
    after["conferences"][0]["years"][0]["type"] = "history"
    after["conferences"][0]["years"].append({"year": 2027, "type": "upcoming", "city": None})
    changes = collect_changes(before, after)
    assert [c["kind"] for c in changes] == ["archived", "created"]
    assert changes[0]["fields"] == [{"field": "type", "before": "upcoming", "after": "history"}]
    assert collect_changes(after, before)[1]["kind"] == "removed"


def test_report_keeps_exact_values_and_highlights_review_points(tmp_path):
    changes = collect_changes(*sample_diff())
    text = render_review_report(changes, "2026-10-16", overview(changes))
    for value in ("NEURIPS 2027", "Sydney", "Paris", "2026-10-12", "Etc/GMT+12", "America/Los_Angeles"):
        assert value in text
    assert "替换了已有值" in text
    assert "早于本次运行日期" in text
    assert "ARR &#124; full paper" in text
    assert "AI 辅助概述" in text
    path = tmp_path / "summary.md"
    write_summary_md(path, {"updated": 1}, True, True, changes=changes, today="2026-10-16")
    assert "Sydney" in path.read_text()
    assert "AI 辅助概述未生成" in path.read_text()


@pytest.mark.parametrize("raw", ["", "not JSON", "[]", "{}", '{"overview": "a", "items": []}'])
def test_bad_ai_output_falls_back_to_exact_diff(raw):
    changes = collect_changes(*sample_diff())
    assert generate_ai_overview(changes, FakeClient([raw])) is None
    assert "Sydney" in render_review_report(changes, "2026-10-16")


def test_unknown_or_duplicate_ai_ids_are_rejected():
    changes = collect_changes(*sample_diff())
    response = overview(changes)
    response["items"][0]["id"] = "fabricated:2099"
    assert generate_ai_overview(changes, FakeClient([json.dumps(response)])) is None
    changes.append({**changes[0], "id": "other:2027"})
    response["items"] = [{"id": changes[0]["id"], "summary": "a"}] * 2
    assert generate_ai_overview(changes, FakeClient([json.dumps(response)])) is None


def test_ai_exception_and_no_changes_do_not_break_reporting():
    class BrokenClient:
        def query(self, system, user):
            raise TimeoutError("API unavailable")
    changes = collect_changes(*sample_diff())
    assert generate_ai_overview(changes, BrokenClient()) is None
    client = FakeClient()
    assert generate_ai_overview([], client) is None
    assert client.calls == []


def test_valid_ai_overview_and_factual_title():
    changes = collect_changes(*sample_diff())
    response = overview(changes)
    client = FakeClient([json.dumps(response)])
    assert generate_ai_overview(changes, client) == response
    assert len(client.calls) == 1
    assert "Sydney" in client.calls[0][1] and "Paris" in client.calls[0][1]
    assert build_pr_title(changes) == "data(conferences): 更新 NEURIPS 2027"


@pytest.mark.parametrize("validate_ok", [True, False])
def test_cli_reports_only_saved_changes_and_makes_one_extra_call(tmp_path, monkeypatch, validate_ok):
    from lib import api_client, search_client
    entry = complete_upcoming()
    entry["city"] = None
    path = write_data(tmp_path, make_data([make_conf(years=[entry])]))
    changes = [{"id": "neurips:2027"}]
    client = FakeClient([json.dumps({"city": "Sydney"}), json.dumps(overview(changes))])
    search = FakeSearch("URL: https://example.com/2027\nSydney, Australia.")
    monkeypatch.setattr(api_client, "build_client_from_env", lambda: client)
    monkeypatch.setattr(search_client, "build_search_client_from_env", lambda: search)
    monkeypatch.setattr(uc, "DATA_PATH", path)
    monkeypatch.setattr(uc, "LOG_DIR", tmp_path / "logs")
    monkeypatch.setattr(uc, "run_validate", lambda root: (validate_ok, "test validation"))
    monkeypatch.setattr(uc, "today_iso", lambda: "2026-10-16")
    assert uc.main() == (0 if validate_ok else 1)
    assert len(client.calls) == (2 if validate_ok else 1)
    report = (tmp_path / "logs/latest_run.md").read_text()
    if validate_ok:
        assert "https://example.com/2027" in report
        assert "AI 辅助概述" in report
        assert "NEURIPS 2027" in (tmp_path / "logs/latest_pr_title.txt").read_text()
    else:
        assert "回滚" in report
        assert "本次没有会议字段变更" in report
        assert "Sydney" not in report
