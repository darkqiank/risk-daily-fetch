import requests
from bs4 import BeautifulSoup
import os

def get_links(use_proxy=False):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxies = {"http": proxy_url, "https": proxy_url} if proxy_url and use_proxy else None

    # 目标URL
    url = 'https://symantec-enterprise-blogs.security.com/blogs/threat-intelligence/'

    # 发送HTTP请求
    response = requests.get(url, proxies=proxies, timeout=20)
    response.encoding = 'utf-8'  # 设置编码

    # 解析HTML
    soup = BeautifulSoup(response.text, 'html.parser')

    # 查找所有文章链接
    articles = soup.find_all('a', class_='blog-teaser__link')

    links = []

    # 打印所有链接
    for article in articles:
        links.append(f"https://symantec-enterprise-blogs.security.com{article['href']}")
    print(len(links))
    return links


