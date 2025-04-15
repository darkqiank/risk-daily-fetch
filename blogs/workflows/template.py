from pathlib import Path

FETCH_TEMPLATES = {
    "curl_cffi": """import os
from curl_cffi import requests
import asyncio

async def a_fetch_url(url, headers=None, timeout=20, use_proxy=False):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxies = {"http": proxy_url, "https": proxy_url} if proxy_url and use_proxy else None
    
    try:
        async with requests.AsyncSession() as session:
            response = await session.get(
                url, 
                headers=headers, 
                proxies=proxies, 
                impersonate="chrome", 
                timeout=timeout,
                stream=True,
                allow_redirects=True,
                verify=False
            )
            response.raise_for_status()
            response.encoding = 'utf-8'
            return await response.atext()
    except Exception as e:
        print(f"获取失败: {str(e)}")
        return None

def fetch_url(url, headers=None, timeout=20, use_proxy=False):
    return asyncio.run(a_fetch_url(url, headers, timeout, use_proxy))
""",

    "httpx": """import os
import httpx
import asyncio

async def a_fetch_url(url, headers=None, timeout=10, use_proxy=False):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxies = {"http://": proxy_url, "https://": proxy_url} if proxy_url and use_proxy else None
    try:
        async with httpx.AsyncClient(proxies=proxies) as client:
            response = await client.get(url, headers=headers, timeout=timeout)
            response.raise_for_status()
            return response.text
    except Exception as e:
        print(f"获取失败: {str(e)}")
        return None

def fetch_url(url, headers=None, timeout=10, use_proxy=False):
    return asyncio.run(a_fetch_url(url, headers, timeout, use_proxy))
""",

    "playwright": """import os
from playwright.async_api import async_playwright
import asyncio

async def a_fetch_url(url, headers=None, timeout=10, use_proxy=False):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxy = {"server": proxy_url} if proxy_url and use_proxy else None
    try:
        async with async_playwright() as p:
            browser_args = {}
            if proxy:
                browser_args["proxy"] = proxy
            browser = await p.chromium.launch(**browser_args)
            page = await browser.new_page()
            if headers:
                await page.set_extra_http_headers(headers)
            await page.goto(url, timeout=timeout * 1000)
            content = await page.content()
            await browser.close()
            return content
    except Exception as e:
        print(f"获取失败: {str(e)}")
        return None

def fetch_url(url, headers=None, timeout=10, use_proxy=False):
    return asyncio.run(a_fetch_url(url, headers, timeout, use_proxy))
""",

    "browseless": """import os
import aiohttp
import asyncio

API_KEY = os.getenv("BROWSERLESS_TOKEN", "").strip()
API_ENDPOINT = os.getenv("BROWSERLESS_URL", "").strip()

async def a_fetch_url(url, headers=None, timeout=10, use_proxy=False):
    payload = {
        "url": url,
        "waitForTimeout": timeout,
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f'{API_ENDPOINT}/content?token={API_KEY}', 
                json=payload, 
                timeout=timeout
            ) as response:
                response.raise_for_status()
                return await response.text()
    except Exception as e:
        print(f"获取失败: {str(e)}")
        return None

def fetch_url(url, headers=None, timeout=10, use_proxy=False):
    return asyncio.run(a_fetch_url(url, headers, timeout, use_proxy))
""",
}


TEMPLATES = {
    "__init__.py": """from .get_links import get_links
from .get_content import get_content
from .fetch_url import fetch_url, a_fetch_url

BASE_URL = {base_url_repr}
BASE_NETLOC = {base_netloc_repr}

__all__ = ['get_links', 'get_content', 'fetch_url','a_fetch_url', 'BASE_URL']
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