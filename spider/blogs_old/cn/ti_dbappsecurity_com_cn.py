from bs4 import BeautifulSoup
from curl_cffi import requests
import os


def get_links(use_proxy=False):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxies = {"http": proxy_url, "https": proxy_url} if proxy_url and use_proxy else None

    url = 'https://ti.dbappsecurity.com.cn/blog/'
    response = requests.get(url, proxies=proxies, impersonate="chrome", timeout=20)

    soup = BeautifulSoup(response.text, 'html.parser')
    items = soup.find_all('h2', class_="entry-title")

    links = []
    # 打印所有链接
    for item in items:
        a = item.findNext('a')
        link = a['href']
        links.append(link)
    print(links)
    return links
