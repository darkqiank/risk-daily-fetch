import requests
from curl_cffi import requests
from bs4 import BeautifulSoup
import os

def get_links(use_proxy=False):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxies = {"http": proxy_url, "https": proxy_url} if proxy_url and use_proxy else None
    # 目标URL
    url = 'https://blog.sekoia.io/'

    # 发送HTTP请求
    response = requests.get(url, impersonate="chrome", timeout=20, proxies=proxies)
    response.encoding = 'utf-8'  # 设置编码

    # print(response.text)
    # 解析HTML
    soup = BeautifulSoup(response.text, 'html.parser')

    # 查找所有文章链接
    items = soup.find_all('h2', class_="notizia-headline notizia-post-loop-post-title")

    links = []

    # 打印所有链接
    for item in items:
        a = item.findNext('a')
        link = a['href']
        if link not in links:
            links.append(link)

    print(links)
    return links


