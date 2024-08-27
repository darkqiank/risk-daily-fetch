import requests
from curl_cffi import requests
from bs4 import BeautifulSoup

def get_links():
    # 目标URL
    url = 'https://www.cybereason.com/blog'

    # 发送HTTP请求
    response = requests.get(url, impersonate="chrome", timeout=20)
    response.encoding = 'utf-8'  # 设置编码

    # print(response.text)
    # 解析HTML
    soup = BeautifulSoup(response.text, 'html.parser')

    # 查找所有文章链接
    articles = soup.find_all('a', class_="post-name")

    links = []

    # 打印所有链接
    for article in articles:
        link = article['href']
        if link not in links:
            links.append(link)
    print(len(links))
    return links


