import requests
import os

def get_links(use_proxy=False):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxies = {"http": proxy_url, "https": proxy_url} if proxy_url and use_proxy else None

    # 目标URL
    url = 'https://www.trellix.com/corpcomsvc/getRecentBlogsFromWarpper?blogsCount=5'

    # 发送HTTP请求
    response = requests.get(url, proxies=proxies, timeout=20)

    print(response.json())
    # 查找所有文章链接
    items = response.json().get("SearchResult")

    links = []

    # 打印所有链接
    for item in items:
        link = item.get('url')
        links.append(link)

    print(links)
    return links


