import requests
from bs4 import BeautifulSoup

def get_links():
    # 目标URL
    url = 'https://blog.morphisec.com/'

    # 发送HTTP请求
    response = requests.get(url)
    response.encoding = 'utf-8'  # 设置编码

    # 解析HTML
    soup = BeautifulSoup(response.text, 'html.parser')

    # 查找所有文章链接
    articles = soup.find_all('a', class_='more-link')

    links = []

    # 打印所有链接
    for article in articles:
        links.append(article['href'])
    print(len(links))
    return links


