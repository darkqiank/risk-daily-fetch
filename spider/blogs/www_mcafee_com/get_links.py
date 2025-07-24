

import feedparser
def get_links(_content):
    feed = feedparser.parse(_content)
    # 打印 RSS 源的标题和条目
    print(f"Feed Title: {feed.feed.title}")
    links = []
    for entry in feed.entries:
        links.append(entry.link)
    print(links)
    return links[:20]

