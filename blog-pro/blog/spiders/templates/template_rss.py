import scrapy
import feedparser


class RssSpider(scrapy.Spider):
    name = 'rss_spider'

    def start_requests(self):
        # 动态获取 RSS URL
        rss_urls = [
            "https://www.microsoft.com/en-us/security/blog/feed/",
            # 你可以在这里添加更多的 RSS URL
        ]
        for url in rss_urls:
            yield scrapy.Request(url=url, callback=self.parse_rss)

    def parse_rss(self, response):
        # 解析 RSS 源
        feed = feedparser.parse(response.body)

        # 打印 RSS 源的标题
        self.logger.info(f"Feed Title: {feed.feed.title}")
        for entry in feed.entries:
            yield {'link': entry.link, 'source': self.name}
