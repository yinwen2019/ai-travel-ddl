"""调用项目自带的 `npm run validate` 校验 conferences.json。

校验失败时由调用方决定回滚（见 update_conferences.py）。
"""
from __future__ import annotations

import subprocess
from pathlib import Path


def run_validate(repo_root: Path) -> tuple[bool, str]:
    """运行 `npm run validate`，返回 (是否通过, 输出文本)。

    npm 不存在或命令异常时视为校验失败。
    """
    try:
        result = subprocess.run(
            ["npm", "run", "validate"],
            cwd=str(repo_root),
            capture_output=True,
            text=True,
            timeout=180,
        )
    except (FileNotFoundError, subprocess.TimeoutExpired) as exc:
        return False, f"validate 调用异常: {exc}"
    output = (result.stdout or "") + (result.stderr or "")
    return result.returncode == 0, output
