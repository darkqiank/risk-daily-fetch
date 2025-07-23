
import os
import aiohttp
import asyncio

API_KEY = os.getenv("BROWSERLESS_TOKEN", "").strip()
API_ENDPOINT = os.getenv("BROWSERLESS_URL", "").strip()

async def a_fetch_url(url, headers=None, timeout=10, use_proxy=False):
    payload = {
        "url": url,
        "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36", 
        "setJavaScriptEnabled": True,
        "gotoOptions": {
            "timeout": timeout*1000,
            "waitUntil": "networkidle2"
        },
        "waitForTimeout": 1000,
        "emulateMediaType": "print",
        "bestAttempt": True
    }
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f'{API_ENDPOINT}/content?token={API_KEY}&blockAds=true', 
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
