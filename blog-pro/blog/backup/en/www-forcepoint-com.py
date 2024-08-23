import requests
from curl_cffi import requests
from bs4 import BeautifulSoup


def get_links():
    # 目标URL
    url = 'https://www.forcepoint.com/blog?page=1'

    # 发送HTTP请求
    response = requests.get(url, impersonate="chrome")
    response.encoding = 'utf-8'  # 设置编码

    # print(response.text)
    # 解析HTML
    soup = BeautifulSoup(response.text, 'html.parser')

    # 查找所有文章链接
    articles = soup.find_all('a', rel="bookmark")

    links = []

    # 打印所有链接
    for article in articles:
        links.append(f"https://www.forcepoint.com{article['href']}")
    print(len(links))
    return links


get_links()