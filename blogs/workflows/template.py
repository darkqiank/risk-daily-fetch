from pathlib import Path

FETCH_TEMPLATES = {
    "default": """import os
import requests

def fetch_url(url, headers=None, timeout=10):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxies = {"http": proxy_url, "https": proxy_url} if proxy_url else None
    try:
        response = requests.get(url, headers=headers, proxies=proxies, timeout=timeout)
        response.raise_for_status()
        response.encoding = 'utf-8'
        return response.text
    except Exception as e:
        print(f"获取失败: {str(e)}")
        return None
""",

    "curl_cffi": """import os
from curl_cffi import requests

def fetch_url(url, headers=None, timeout=20):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxies = {"http": proxy_url, "https": proxy_url} if proxy_url else None
    try:
        response = requests.get(url, headers=headers, proxies=proxies, impersonate="chrome", timeout=timeout)
        response.raise_for_status()
        response.encoding = 'utf-8'
        return response.text
    except Exception as e:
        print(f"获取失败: {str(e)}")
        return None
""",

    "httpx": """import os
import httpx

def fetch_url(url, headers=None, timeout=10):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxies = {"http://": proxy_url, "https://": proxy_url} if proxy_url else None
    try:
        with httpx.Client(proxies=proxies) as client:
            response = client.get(url, headers=headers, timeout=timeout)
            response.raise_for_status()
            return response.text
    except Exception as e:
        print(f"获取失败: {str(e)}")
        return None
""",

    "playwright": """import os
from playwright.sync_api import sync_playwright

def fetch_url(url, headers=None, timeout=10):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxy = {"server": proxy_url} if proxy_url else None
    try:
        with sync_playwright() as p:
            browser_args = {}
            if proxy:
                browser_args["proxy"] = proxy
            browser = p.chromium.launch(**browser_args)
            page = browser.new_page()
            if headers:
                page.set_extra_http_headers(headers)
            page.goto(url, timeout=timeout * 1000)
            content = page.content()
            browser.close()
            return content
    except Exception as e:
        print(f"获取失败: {str(e)}")
        return None
""",

    "browseless": """import requests
import os

API_KEY = os.getenv("BROWSERLESS_TOKEN", "").strip()
API_ENDPOINT = os.getenv("BROWSERLESS_URL", "").strip()

def fetch_url(url, headers=None, timeout=10):
    payload = {
        "url": url,
        "waitForTimeout": timeout,
    }
    try:
        response = requests.post(f'{API_ENDPOINT}/content?token={API_KEY}', json=payload, timeout=timeout)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"获取失败: {str(e)}")
        return None""",
}


TEMPLATES = {
    "__init__.py": """from .get_links import get_links
from .get_content import get_content
from .fetch_url import fetch_url

BASE_URL = {base_url_repr}
BASE_NETLOC = {base_netloc_repr}

__all__ = ['get_links', 'get_content', 'fetch_url', 'BASE_URL']
""",
    "get_links.py": """
def get_links(_content):
    return []
""",

    "get_content.py": """
def get_content(_content):
    return None
""",
    "fetch_url.py": """
{fetch_url_repr}"""
}