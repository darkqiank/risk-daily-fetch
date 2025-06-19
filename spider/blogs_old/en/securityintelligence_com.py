from curl_cffi import requests
import json
import os

def get_links(use_proxy=False):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxies = {"http": proxy_url, "https": proxy_url} if proxy_url and use_proxy else None

    # 目标URL
    url = 'https://www-api.ibm.com/search/api/v2'
    
    # 请求头部
    headers = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Origin': 'https://www.ibm.com',
        'Referer': 'https://www.ibm.com/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
    }
    
    # 请求体
    data = {
        "appId": "thinkhub",
        "scopes": ["thinkhub"],
        "query": {
            "bool": {
                "must": [],
                "filter": [{
                    "nested": {
                        "path": "field_hierarchy_01",
                        "query": {
                            "term": {
                                "field_hierarchy_01.@id": "Cybersecurity"
                            }
                        }
                    }
                }]
            }
        },
        "size": 30,
        "from": 0,
        "sort": [{"dcdate": "desc"}, {"_score": "desc"}],
        "lang": "en",
        "cc": "us",
        "_source": ["_id", "title", "url"]
    }

    # 发送HTTP请求
    response = requests.post(
        url,
        headers=headers,
        json=data,
        proxies=proxies,
        impersonate="chrome",
        timeout=20
    )
    response.encoding = 'utf-8'

    res = response.json()
    hits = res.get("hits", {}).get("hits", [])

    links = []
    for hit in hits:
        url = hit.get("_source", {}).get("url")
        if url and not url.startswith("https://www.ibm.com/think/topics"):
            links.append(url)

    print(links)
    return links


