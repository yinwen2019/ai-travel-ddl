"""联网搜索客户端（搜索接地）。

DeepSeek 等裸模型不带联网能力，对「未来会议 DDL/地点」这类训练数据外的信息无法获取。
本模块先用搜索 API（默认 Tavily）检索真实网页，把结果正文拼成上下文，再交给 LLM 抽取，
从而复刻 Perplexity / Claude Code 的「模型 + 搜索工具」模式。

环境变量：
- TAVILY_API_KEY（见 .env.example）

依赖注入：update_conferences.run() 接收任意实现 SearchClient 协议的对象，测试可注入 Fake。
"""
from __future__ import annotations

import os
import time
from typing import Protocol

import requests
from dotenv import load_dotenv

from .source_policy import UNTRUSTED_DOMAINS, is_trusted_url, is_untrusted_url

TAVILY_URL = "https://api.tavily.com/search"

# 指数退避：2s -> 4s -> 8s，最多 3 次
_RETRY_BACKOFFS = [2, 4, 8]
_RETRY_STATUS = {429, 500, 502, 503, 504}

DEFAULT_MAX_RESULTS = 5


class SearchClient(Protocol):
    """搜索客户端协议：给定查询，返回拼好的网页正文上下文文本。"""

    def search(
        self,
        query: str,
        max_results: int = DEFAULT_MAX_RESULTS,
        trusted_domains: set[str] | None = None,
    ) -> str:  # pragma: no cover
        ...


class NullSearchClient:
    """无搜索 Key 时的占位：返回空串（退化为裸模型查询）。"""

    def search(
        self,
        query: str,
        max_results: int = DEFAULT_MAX_RESULTS,
        trusted_domains: set[str] | None = None,
    ) -> str:
        return ""


class TavilyClient:
    """Tavily 搜索客户端，含指数退避重试。"""

    def __init__(self, api_key: str, timeout: float = 60.0) -> None:
        self._api_key = api_key
        self._timeout = timeout

    def search(
        self,
        query: str,
        max_results: int = DEFAULT_MAX_RESULTS,
        trusted_domains: set[str] | None = None,
    ) -> str:
        payload = {
            "query": query,
            "max_results": max_results,
            "search_depth": "basic",
            "include_answer": False,
            "exclude_domains": sorted(UNTRUSTED_DOMAINS),
        }
        if trusted_domains:
            payload["include_domains"] = sorted(trusted_domains)
        headers = {
            "Authorization": f"Bearer {self._api_key}",
            "Content-Type": "application/json",
        }

        last_error: str | None = None
        for backoff in [0] + _RETRY_BACKOFFS:
            if backoff:
                time.sleep(backoff)
            try:
                resp = requests.post(TAVILY_URL, json=payload, headers=headers, timeout=self._timeout)
            except requests.RequestException as exc:
                last_error = f"网络异常: {exc}"
                continue
            if resp.status_code in _RETRY_STATUS:
                last_error = f"HTTP {resp.status_code}"
                continue
            if resp.status_code != 200:
                print(f"[search_client] Tavily HTTP {resp.status_code}: {resp.text[:200]}")
                return ""
            try:
                data = resp.json()
            except ValueError as exc:
                last_error = f"响应解析失败: {exc}"
                continue
            return _format_context(data, trusted_domains=trusted_domains)

        if last_error:
            print(f"[search_client] Tavily 搜索失败（已重试 {len(_RETRY_BACKOFFS)} 次）: {last_error}")
        return ""


def _format_context(data: object, trusted_domains: set[str] | None = None) -> str:
    """把 Tavily 响应拼成喂给 LLM 的上下文文本。

    搜索摘要是模型生成文本，不作为事实来源；这里只保留真实搜索结果。
    当传入 trusted_domains 时，非可信域名结果会被丢弃。
    """
    if not isinstance(data, dict):
        return ""
    parts: list[str] = []
    for i, res in enumerate(data.get("results", []) or [], 1):
        if not isinstance(res, dict):
            continue
        title = res.get("title", "") or ""
        url = res.get("url", "") or ""
        content = res.get("content", "") or ""
        if is_untrusted_url(url):
            continue
        if trusted_domains and not is_trusted_url(url, trusted_domains):
            continue
        parts.append(f"## [{i}] {title}\nURL: {url}\n{content}")
    return "\n\n".join(parts).strip()


def build_search_client_from_env() -> SearchClient:
    """根据环境变量构建搜索客户端；无 Key 时返回 NullSearchClient。"""
    load_dotenv()
    api_key = os.getenv("TAVILY_API_KEY")
    if not api_key:
        print("[search_client] 未配置 TAVILY_API_KEY，搜索接地被跳过（退化为裸模型查询）。")
        return NullSearchClient()
    return TavilyClient(api_key=api_key)
