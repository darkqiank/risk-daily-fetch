import requests
from curl_cffi import requests
from bs4 import BeautifulSoup
import os

def get_links(use_proxy=False):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxies = {"http": proxy_url, "https": proxy_url} if proxy_url and use_proxy else None

    # 目标URL
    urls = ['https://securelist.com/categories/',
            'https://securelist.com/category/apt-reports/',
            'https://securelist.com/category/malware-descriptions/',
            'https://securelist.com/category/malware-reports/'
            ]
    links = []
    for url in urls:
        # 发送HTTP请求
        response = requests.get(url, proxies=proxies, impersonate="chrome", timeout=20)
        response.encoding = 'utf-8'  # 设置编码

        # print(response.text)
        # 解析HTML
        soup = BeautifulSoup(response.text, 'html.parser')

        # 查找所有文章链接
        items = soup.find_all('a', class_="c-card__link")

        # 打印所有链接
        for item in items:
            links.append(f"{item['href']}")

        print(links)
        return links


