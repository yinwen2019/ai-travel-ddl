"""REQ-E02 时区回归：Python 清洗结果须与实际 Node/Ajv 校验一致。"""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import pytest

from lib.completeness import is_key_fields_complete
from lib.logger import write_summary_md
from lib.parser import parse_ai_response
from lib.timezones import is_valid_timezone
import update_conferences as uc
from test_update import FakeClient, FakeSearch, complete_upcoming, make_conf, make_data, write_data

ROOT = Path(__file__).resolve().parents[2]
CASES = [
    ("America/Los_Angeles", True),
    ("Etc/GMT+12", True),
    ("Etc/GMT-12", True),
    ("America/Argentina/Buenos_Aires", True),
    ("PST", False),
    ("UTC", False),
    ("AoE", False),
    ("America/Imaginary_City", False),
    ("Etc/GMT+99", False),
    ("america/los_angeles", False),
    ("Europe/Paris\n", False),
]


@pytest.mark.parametrize("timezone,expected", CASES)
def test_parser_and_completeness_check_real_iana_zones(timezone, expected, caplog):
    ddl = {"date": "2027-05-01", "timezone": timezone}
    assert is_valid_timezone(timezone) is expected
    parsed = parse_ai_response(json.dumps({"paper_ddl": [ddl]}))
    assert bool(parsed) is expected
    entry = complete_upcoming()
    entry["paper_ddl"] = [ddl]
    assert is_key_fields_complete(entry, make_conf()) is expected
    if not expected:
        assert "忽略非法 DDL 时区" in caplog.text


def test_node_schema_agrees_with_python():
    # 使用生产时的格式检查器和 Schema，防止两套规则再次分歧。
    script = """
import Ajv from 'ajv';
import { readFileSync } from 'node:fs';
import { isKnownTimezone } from './scripts/lib/timezones.mjs';
const schema = JSON.parse(readFileSync('data/schema.json', 'utf8'));
const ajv = new Ajv({ strict: false });
ajv.addFormat('iana-timezone', { type: 'string', validate: isKnownTimezone });
const validate = ajv.compile(schema.definitions.ddlEntry);
const zones = JSON.parse(readFileSync(0, 'utf8'));
console.log(JSON.stringify(zones.map(timezone => validate({date: '2027-05-01', timezone}))));
"""
    result = subprocess.run(
        ["node", "--input-type=module", "-e", script], cwd=ROOT,
        input=json.dumps([zone for zone, _ in CASES]), text=True, capture_output=True, check=True,
    )
    assert json.loads(result.stdout) == [expected for _, expected in CASES]


@pytest.mark.parametrize("timezone,expected", [("Etc/GMT+12", "Etc/GMT+12"),
                                               ("Etc/GMT+99", "America/Los_Angeles")])
def test_update_with_real_validation_preserves_good_data(tmp_path, timezone, expected):
    # 在隔离目录调用真正的 npm 校验；既验证合法时区不再回滚，也验证非法值不覆盖原值。
    (tmp_path / "data").mkdir()
    shutil.copytree(ROOT / "scripts", tmp_path / "scripts", ignore=shutil.ignore_patterns(
        "__pycache__", ".pytest_cache", "update_logs", "tests",
    ))
    for filename in ("schema.json", "locations.json"):
        shutil.copy(ROOT / "data" / filename, tmp_path / "data" / filename)
    shutil.copy(ROOT / "package.json", tmp_path / "package.json")
    (tmp_path / "node_modules").symlink_to(ROOT / "node_modules", target_is_directory=True)
    entry = complete_upcoming()
    entry["city"] = None
    path = write_data(tmp_path / "data", make_data([make_conf(years=[entry])]))
    response = {"city": "Sydney", "paper_ddl": [{"date": "2027-05-01", "timezone": timezone}]}
    context = "URL: https://example.com/2027\nSydney, Australia. Deadline 2027-05-01."
    result = uc.run(path, tmp_path, FakeClient([json.dumps(response)]), FakeSearch(context), today="2026-10-16")
    assert result.changed
    assert result.validate_ok, result.error
    assert not result.rolled_back
    saved = json.loads(path.read_text())["conferences"][0]["years"][0]
    assert saved["paper_ddl"][0]["timezone"] == expected


def test_failure_summary_contains_error(tmp_path):
    path = tmp_path / "summary.md"
    write_summary_md(path, {}, True, False, "bad timezone: Etc/GMT+99")
    assert "失败（已回滚）" in path.read_text()
    assert "bad timezone: Etc/GMT+99" in path.read_text()
