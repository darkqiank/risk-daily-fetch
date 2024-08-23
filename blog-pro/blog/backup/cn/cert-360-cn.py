import scrapy
from blog.items import LinkItem


class DefaultSpider(scrapy.Spider):
    name = 'cert.360.cn'

    def start_requests(self):
        urls = ['https://cert.360.cn/report/searchbypage?length=10&start=0']
        for url in urls:
            yield scrapy.Request(url=url, callback=self.parse)

    def parse(self, response):
        datas = response.json().get("data", [])
        links = []
        for data in datas:
            link = f"https://cert.360.cn/report/detail?id={data.get('id')}"
            links.append(link)
            link_item = LinkItem(link=link, source=self.name)
            yield link_item
        self.log(f'Total links: {len(links)}')
