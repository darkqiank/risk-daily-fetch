from curl_cffi import requests
from bs4 import BeautifulSoup
import os


def get_links(use_proxy=False):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxies = {"http": proxy_url, "https": proxy_url} if proxy_url and use_proxy else None

    url = 'https://cybersecurity.att.com/blogs/'
    response = requests.get(url, proxies=proxies, impersonate="chrome", timeout=20)
    soup = BeautifulSoup(response.text, 'html.parser')
    items = soup.find_all('div', class_="blog-card-cta")

    links = []
    # 打印所有链接
    for item in items:
        a = item.findNext('a')
        link = f"https://cybersecurity.att.com{a['href']}"
        links.append(link)
    print(links)
    return links

