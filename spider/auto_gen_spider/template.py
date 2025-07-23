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
    proxy = proxy_url if proxy_url and use_proxy else None
    try:
        async with httpx.AsyncClient(proxy=proxy) as client:
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

    "browserless": """import os
import aiohttp
import asyncio

API_KEY = os.getenv("BROWSERLESS_TOKEN", "").strip()
API_ENDPOINT = os.getenv("BROWSERLESS_URL", "").strip()

async def a_fetch_url(url, headers=None, timeout=10, use_proxy=False):
    payload = {
        "url": url,
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36", 
        "setJavaScriptEnabled": True,
        "waitForTimeout": timeout*1000
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f'{API_ENDPOINT}/content?token={API_KEY}', 
                json=payload, 
                timeout=60
            ) as response:
                response.raise_for_status()
                return await response.text()
    except Exception as e:
        print(f"获取失败: {str(e)}")
        return None

def fetch_url(url, headers=None, timeout=10, use_proxy=False):
    return asyncio.run(a_fetch_url(url, headers, timeout, use_proxy))
""",
    "pdf": """import os
from curl_cffi import requests
import asyncio
import fitz

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
            content_type = response.headers.get("Content-Type", "").lower()
            if "application/pdf" in content_type:
                pdf_bytes = await response.acontent()
                # 使用 PyMuPDF 解析内容
                doc = fitz.open(stream=pdf_bytes, filetype="pdf")
                text = ""
                for page in doc:
                    text += page.get_text()
                doc.close()
                return text
            else:
                response.encoding = 'utf-8'
                return await response.atext()
    except Exception as e:
        print(f"获取失败: {str(e)}")
        return None

def fetch_url(url, headers=None, timeout=20, use_proxy=False):
    return asyncio.run(a_fetch_url(url, headers, timeout, use_proxy))
"""
}

SOURCE_TEMPLATES = {
    "html": """
def get_links(_content):
    return []
""",
    "rss": """
import feedparser
def get_links(_content):
    feed = feedparser.parse(_content)
    # 打印 RSS 源的标题和条目
    print(f"Feed Title: {feed.feed.title}")
    links = []
    for entry in feed.entries:
        links.append(entry.link)
    print(links)
    return links
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
{source_type_repr}
""",

    "get_content.py": """from readability import Document
from bs4 import BeautifulSoup
def get_content(_content):
    doc = Document(_content)
    # 获取文章的标题
    title = doc.title()
    summary_html = doc.summary()
    soup = BeautifulSoup(summary_html, 'html.parser')
    inner_text = soup.get_text(separator='\\n')  # Using separator for better readability
    return {
        "title": title,
        "pub_date": "",
        "content": inner_text   
    }
""",
    "fetch_url.py": """
{fetch_url_repr}"""
}