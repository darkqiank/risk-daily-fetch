import feedparser
from curl_cffi import requests

def get_links():
    # 解析 RSS 源
    rss_url = "https://www.govinfosecurity.com/rss-feeds"
    # 发送HTTP请求
    response = requests.get( rss_url, impersonate="chrome", timeout=20)
    response.encoding = 'utf-8'  # 设置编码

    feed = feedparser.parse(response.text)
    # 打印 RSS 源的标题和条目
    print(f"Feed Title: {feed.feed.title}")
    links = []
    for entry in feed.entries:
        links.append(entry.link)
    print(links)
    return links

if __name__ == '__main__':
    links = get_links()