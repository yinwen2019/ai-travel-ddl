"""联网 API 调用 + 重试。

采用 OpenAI 兼容的 /chat/completions 接口，兼容 Perplexity（自带联网搜索）与 OpenAI。
环境变量（见 .env.example）：
- PERPLEXITY_API_KEY / OPENAI_API_KEY
- AI_API_BASE_URL（默认 Perplexity）
- AI_MODEL（默认 llama-3.1-sonar-large-128k-online）

依赖注入：update_conferences.run() 接收任意实现 AIClient 协议的对象，
测试可注入 FakeAIClient，无需真实 API Key。
"""
from __future__ import annotations

import os
import time
from typing import Protocol

import requests
from dotenv import load_dotenv

PERPLEXITY_BASE_URL = "https://api.perplexity.ai"
DEFAULT_MODEL = "llama-3.1-sonar-large-128k-online"

# 指数退避：2s -> 4s -> 8s，最多 3 次
_RETRY_BACKOFFS = [2, 4, 8]
_RETRY_STATUS = {429, 500, 502, 503, 504}


class AIClient(Protocol):
    """AI 客户端协议：给定 system/user prompt，返回原始响应文本。"""

    def query(self, system: str, user: str) -> str:  # pragma: no cover - 协议定义
        ...


class NullClient:
    """无 API Key 时的占位客户端：始终返回空串（不产生任何合并）。"""

    def query(self, system: str, user: str) -> str:
        return ""


class HttpAIClient:
    """OpenAI 兼容的联网 API 客户端，含指数退避重试。"""

    def __init__(
        self,
        api_key: str,
        base_url: str = PERPLEXITY_BASE_URL,
        model: str = DEFAULT_MODEL,
        timeout: float = 60.0,
    ) -> None:
        self._api_key = api_key
        self._base_url = base_url.rstrip("/")
        self._model = model
        self._timeout = timeout

    def query(self, system: str, user: str) -> str:
        url = f"{self._base_url}/chat/completions"
        payload = {
            "model": self._model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "temperature": 0,
        }
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

        last_error: str | None = None
        for attempt, backoff in enumerate([0] + _RETRY_BACKOFFS):
            if backoff:
                time.sleep(backoff)
            try:
                resp = requests.post(url, json=payload, headers=headers, timeout=self._timeout)
            except requests.RequestException as exc:
                last_error = f"网络异常: {exc}"
                continue
            if resp.status_code in _RETRY_STATUS:
                last_error = f"HTTP {resp.status_code}"
                continue
            if resp.status_code != 200:
                return ""  # 非重试型错误，安静失败
            try:
                data = resp.json()
                return data["choices"][0]["message"]["content"] or ""
            except (ValueError, KeyError, IndexError, TypeError) as exc:
                last_error = f"响应解析失败: {exc}"
                continue
        # 重试用尽
        if last_error:
            print(f"[api_client] 查询失败（已重试 {len(_RETRY_BACKOFFS)} 次）: {last_error}")
        return ""


def build_client_from_env() -> AIClient:
    """根据环境变量构建客户端；无 Key 时返回 NullClient。"""
    load_dotenv()
    api_key = os.getenv("PERPLEXITY_API_KEY") or os.getenv("OPENAI_API_KEY")
    if not api_key:
        print("[api_client] 未配置 PERPLEXITY_API_KEY / OPENAI_API_KEY，查询将被跳过。")
        return NullClient()
    base_url = os.getenv("AI_API_BASE_URL") or PERPLEXITY_BASE_URL
    model = os.getenv("AI_MODEL") or DEFAULT_MODEL
    return HttpAIClient(api_key=api_key, base_url=base_url, model=model)
