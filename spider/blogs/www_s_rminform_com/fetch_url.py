import os
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
            response.raise_for_status()  # 移除await，因为这不是异步方法
            response.encoding = 'utf-8'
            return await response.atext()
    except Exception as e:
        print(f"获取失败: {str(e)}")
        return None

def fetch_url(url, headers=None, timeout=20, use_proxy=False):
    return asyncio.run(a_fetch_url(url, headers, timeout, use_proxy))