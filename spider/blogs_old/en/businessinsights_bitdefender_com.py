import feedparser
import os
from curl_cffi import requests

def get_links(use_proxy=False):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxies = {"http": proxy_url, "https": proxy_url} if proxy_url and use_proxy else None
    # 解析 RSS 源
    html = requests.get("https://www.bitdefender.com/nuxt/api/en-us/rss/labs/", proxies=proxies, timeout=20)
    # rss_url = "https://www.bitdefender.com/nuxt/api/en-us/rss/labs/"
    feed = feedparser.parse(html.text)
    # 打印 RSS 源的标题和条目
    # print(f"Feed Title: {feed.feed.title}")
    links = []
    for entry in feed.entries:
        links.append(entry.link)
    print(links)
    return links

