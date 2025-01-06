from curl_cffi import requests
from bs4 import BeautifulSoup


def get_links():
    # 目标URL
    url = 'https://www.secrss.com'

    # 发送HTTP请求
    response = requests.get(url, impersonate="chrome", timeout=20)
    response.encoding = 'utf-8'  # 设置编码

    # print(response.text)
    # 解析HTML
    soup = BeautifulSoup(response.text, 'html.parser')

    # 查找所有文章链接
    _list = soup.find('div', class_='row articles-row').find('section', class_='article-list')
    items = _list.find_all('li', class_="list-item")

    links = []

    # 打印所有链接
    for item in items:
        a = item.findNext('a')
        links.append(a['href'])

    print(links)
    return links

if __name__ == '__main__':
    links = get_links()