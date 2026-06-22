"""pytest 配置：将 scripts/ 加入 sys.path，使 `from lib...` 与 `import update_conferences` 可用。"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
