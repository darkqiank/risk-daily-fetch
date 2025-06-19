
import os
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
