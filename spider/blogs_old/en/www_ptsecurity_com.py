from curl_cffi import requests
import os
import json

def get_links(use_proxy=False):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxies = {"http": proxy_url, "https": proxy_url} if proxy_url and use_proxy else None

    # 新的目标URL
    url = 'https://global.ptsecurity.com/api/analytics/articles'
    
    # 请求头部
    headers = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Origin': 'https://global.ptsecurity.com',
        'Referer': 'https://global.ptsecurity.com/analytics',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
    }
    
    # 请求体
    data = {
        "filterParams": {},
        "locale": "en",
        "page": 1
    }

    # 发送HTTP请求
    response = requests.post(
        url, 
        headers=headers, 
        json=data,
        proxies=proxies, 
        timeout=20
    )
    response.encoding = 'utf-8'  # 设置编码

    res = response.json()
    articles = res.get("articles", [])

    links = []
    for article in articles:
        link = article.get("slug")
        if link:
            links.append(f'https://global.ptsecurity.com/analytics/{link}')
    
    print(links)
    return links

