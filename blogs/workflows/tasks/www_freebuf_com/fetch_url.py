
import os
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
