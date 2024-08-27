import requests
from curl_cffi import requests
from bs4 import BeautifulSoup

def get_links():
    # 目标URL
    url = 'https://securityintelligence.com/all-articles/'

    # 发送HTTP请求
    response = requests.get(url, impersonate="chrome", timeout=20)
    response.encoding = 'utf-8'  # 设置编码

    # print(response.text)
    # 解析HTML
    soup = BeautifulSoup(response.text, 'html.parser')

    # 查找所有文章链接
    items = soup.find_all('a', class_="article__content_link")

    links = []

    # 打印所有链接
    for item in items:
        link = item['href']
        if link.startswith('http'):
            links.append(item['href'])

    print(links)
    return links


