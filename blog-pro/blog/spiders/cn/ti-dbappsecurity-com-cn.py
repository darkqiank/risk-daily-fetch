from bs4 import BeautifulSoup
from blog.items import LinkItem
import scrapy


class DefaultSpider(scrapy.Spider):
    name = 'ti.dbappsecurity.com.cn'
    custom_settings = {
        "DOWNLOAD_HANDLERS": {
            "http": "scrapy_impersonate.ImpersonateDownloadHandler",
            "https": "scrapy_impersonate.ImpersonateDownloadHandler",
        },
        "TWISTED_REACTOR": "twisted.internet.asyncioreactor.AsyncioSelectorReactor",
    }

    def start_requests(self):
        url = 'https://ti.dbappsecurity.com.cn/blog/'
        yield scrapy.Request(url, dont_filter=True,
                             meta={"impersonate": "chrome"})

    def parse(self, response):
        soup = BeautifulSoup(response.text, 'html.parser')
        items = soup.find_all('h2', class_="entry-title")

        # 打印所有链接
        for item in items:
            a = item.findNext('a')
            link = a['href']
            link_item = LinkItem(link=link, source=self.name)
            yield link_item
