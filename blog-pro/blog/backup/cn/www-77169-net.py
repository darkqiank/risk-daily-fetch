import requests
from curl_cffi import requests
from bs4 import BeautifulSoup


def get_links():
    # 目标URL
    url = 'https://www.77169.net/'

    # 发送HTTP请求
    response = requests.get(url, impersonate="chrome")
    response.encoding = 'utf-8'  # 设置编码

    # print(response.text)
    # 解析HTML
    soup = BeautifulSoup(response.text, 'html.parser')

    # 查找所有文章链接
    items = soup.find_all('article', class_="post_main simple")

    links = []

    # 打印所有链接
    for item in items:
        a = item.findNext('a')
        links.append(a['href'])

    print(links)
    return links


get_links()