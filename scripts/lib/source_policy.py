"""官方来源策略。

AI 更新只应从会议官网或主办方可信域名抽取事实；会议聚合站、山寨会议站
即使出现在搜索结果中，也不能作为地点/日期/DDL 的来源。
"""
from __future__ import annotations

from typing import Mapping
from urllib.parse import urlparse


UNTRUSTED_DOMAINS = {
    "10times.com",
    "allconferencealert.com",
    "allconferencealert.net",
    "conferencealerts.com",
    "conferenceindex.org",
    "conferencelists.org",
    "ourglocal.com",
    "resurchify.com",
    "waset.org",
    "wikicfp.com",
}

EXTRA_TRUSTED_DOMAINS: dict[str, set[str]] = {
    "cvpr": {"thecvf.com", "cvpr.thecvf.com"},
    "iccv": {"thecvf.com", "iccv.thecvf.com", "computer.org"},
    "eccv": {"ecva.net", "eccv.ecva.net"},
    "acl": {"aclweb.org"},
    "emnlp": {"aclweb.org", "sigdat.org"},
    "naacl": {"aclweb.org", "naacl.org"},
    "coling": {"coling.org", "aclweb.org"},
}


def hostname(url: object) -> str:
    """Return normalized hostname for a URL-like value."""
    if not isinstance(url, str) or not url:
        return ""
    parsed = urlparse(url)
    host = parsed.netloc or parsed.path.split("/", 1)[0]
    return host.lower().removeprefix("www.")


def parent_domain(host: str) -> str:
    """Return a simple parent domain for ordinary domains."""
    parts = host.split(".")
    if len(parts) <= 2:
        return host
    return ".".join(parts[-2:])


def is_domain_match(host: str, domains: set[str]) -> bool:
    """Whether host is exactly a trusted domain or one of its subdomains."""
    clean_host = host.lower().removeprefix("www.")
    for domain in domains:
        clean_domain = domain.lower().removeprefix("www.")
        if clean_host == clean_domain or clean_host.endswith("." + clean_domain):
            return True
    return False


def trusted_domains(conference: Mapping[str, object]) -> set[str]:
    """Build trusted domains from conference.website plus known organizer domains."""
    domains: set[str] = set()
    host = hostname(conference.get("website"))
    if host:
        domains.add(host)
        domains.add(parent_domain(host))
    conf_id = conference.get("id")
    if isinstance(conf_id, str):
        domains.update(EXTRA_TRUSTED_DOMAINS.get(conf_id, set()))
    return {d for d in domains if d}


def is_untrusted_url(url: object) -> bool:
    """Whether URL belongs to a known unreliable conference aggregator."""
    host = hostname(url)
    return bool(host and is_domain_match(host, UNTRUSTED_DOMAINS))


def is_trusted_url(url: object, domains: set[str]) -> bool:
    """Whether URL is acceptable under the trusted-domain policy."""
    host = hostname(url)
    if not host or is_untrusted_url(url):
        return False
    return not domains or is_domain_match(host, domains)


def build_search_query(conference: Mapping[str, object], year: object) -> str:
    """Build a source-biased search query for one conference edition."""
    name = conference.get("name") or conference.get("id")
    full_name = conference.get("full_name") or ""
    domains = sorted(trusted_domains(conference))
    site_clause = " ".join(f"site:{domain}" for domain in domains[:4])
    return (
        f"{name} {year} {full_name} official conference location dates "
        f"submission deadline {site_clause}"
    ).strip()
