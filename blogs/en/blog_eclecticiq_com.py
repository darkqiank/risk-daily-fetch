import requests
from bs4 import BeautifulSoup

def get_links():
    # 目标URL
    url = 'https://blog.eclecticiq.com/'

    # 发送HTTP请求
    response = requests.get(url)
    response.encoding = 'utf-8'  # 设置编码

    # print(response.text)
    # 解析HTML
    soup = BeautifulSoup(response.text, 'html.parser')

    # 查找所有文章链接
    items = soup.find_all('a', class_="block mb-6")

    links = []

    # 打印所有链接
    for item in items:
        links.append(f"{item['href']}")

    print(links)
    return links


