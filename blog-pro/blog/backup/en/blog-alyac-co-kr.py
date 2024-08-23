import requests
from curl_cffi import requests
from bs4 import BeautifulSoup


def get_links():
    # 目标URL
    url = 'https://blog.alyac.co.kr/'

    # 发送HTTP请求
    response = requests.get(url, impersonate="chrome")
    response.encoding = 'utf-8'  # 设置编码

    # print(response.text)
    # 解析HTML
    soup = BeautifulSoup(response.text, 'html.parser')

    # 查找所有文章链接
    items = soup.find_all('a', class_="link_notice")

    links = []

    # 打印所有链接
    for item in items:
        links.append(f"https://blog.alyac.co.kr{item['href']}")

    print(links)
    return links


get_links()