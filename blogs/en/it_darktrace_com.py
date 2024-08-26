import requests
from curl_cffi import requests
from bs4 import BeautifulSoup

def get_links():
    # 目标URL
    url = 'https://darktrace.com/blog'

    # 发送HTTP请求
    response = requests.get(url, impersonate="chrome")
    response.encoding = 'utf-8'  # 设置编码

    # print(response.text)
    # 解析HTML
    soup = BeautifulSoup(response.text, 'html.parser')

    # 查找所有文章链接
    items = soup.find_all('div', class_="inside-the-soc_cl-item w-dyn-item")
    items.extend(soup.find_all('div', class_="resource-card w-dyn-item"))

    links = []

    # 打印所有链接
    for item in items:
        a = item.findNext('a')
        link = f"https://darktrace.com{a['href']}"
        if link not in links:
            links.append(link)

    print(links)
    return links


