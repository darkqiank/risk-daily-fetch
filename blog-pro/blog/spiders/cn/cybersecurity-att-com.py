from bs4 import BeautifulSoup
import scrapy


class DefaultSpider(scrapy.Spider):
    name = 'cybersecurity.att.com'
    custom_settings = {
        "DOWNLOAD_HANDLERS": {
            "http": "scrapy_impersonate.ImpersonateDownloadHandler",
            "https": "scrapy_impersonate.ImpersonateDownloadHandler",
        },
        "TWISTED_REACTOR": "twisted.internet.asyncioreactor.AsyncioSelectorReactor",
    }

    def start_requests(self):
        url = 'https://cybersecurity.att.com/blogs/'
        yield scrapy.Request(url, dont_filter=True,
                meta={"impersonate": "chrome"},)

    def parse(self, response):
        soup = BeautifulSoup(response.text, 'html.parser')
        items = soup.find_all('div', class_="blog-card-cta")

        # 打印所有链接
        for item in items:
            a = item.findNext('a')
            link = f"https://cybersecurity.att.com{a['href']}"
            yield {'link': link, 'source': self.name}