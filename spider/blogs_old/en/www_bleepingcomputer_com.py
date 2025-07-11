import feedparser
from curl_cffi import requests
import os

def get_links(use_proxy=False):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxies = {"http": proxy_url, "https": proxy_url} if proxy_url and use_proxy else None
    # 解析 RSS 源
    rss_url = "https://www.bleepingcomputer.com/feed/"
    # 发送HTTP请求
    response = requests.get( rss_url, proxies=proxies, impersonate="chrome", timeout=20)
    response.encoding = 'utf-8'  # 设置编码

    print(response.text)
    feed = feedparser.parse(response.text)
    # 打印 RSS 源的标题和条目
    print(f"Feed Title: {feed.feed.title}")
    links = []
    for entry in feed.entries:
        links.append(entry.link)
    print(links)
    return links

# if __name__ == '__main__':
#     links = get_links()