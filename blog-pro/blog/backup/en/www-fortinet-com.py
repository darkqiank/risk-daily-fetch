import feedparser


def get_links():
    # 解析 RSS 源
    rss_url = "https://feeds.fortinet.com/fortinet/blog/threat-research&x=1"
    feed = feedparser.parse(rss_url)
    # 打印 RSS 源的标题和条目
    print(f"Feed Title: {feed.feed.title}")
    links = []
    for entry in feed.entries:
        links.append(entry.link)
    print(links)
    return links

get_links()
