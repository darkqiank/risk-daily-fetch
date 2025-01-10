import requests
from curl_cffi import requests
import re
from bs4 import BeautifulSoup


def get_links():
    # 目标URL
    url = 'https://www.freebuf.com/'

    # 发送HTTP请求
    response = requests.get(url, impersonate="chrome", timeout=20)
    response.encoding = 'utf-8'  # 设置编码

    soup = BeautifulSoup(response.text, 'html.parser')
    items = soup.find_all('div', class_="title-view")
    links = []
    # 打印所有链接
    for item in items:
        a = item.findNext('a')
        link = a['href']
        links.append(f"https://www.freebuf.com{link}")
    print(links)
    return links

    # # 获取网页文本
    # web_text = response.text
    #
    # # 正则表达式模式
    # pattern = r'href="(/articles/network/[^"]+)"'


    # # 查找所有文章链接
    # uris = re.findall(pattern, web_text)
    # # print(uris)
    # links = []
    #
    # # 打印所有链接
    # for uri in uris:
    #     link = f"https://www.freebuf.com{uri}"
    #     if link not in links:
    #         links.append(link)
    # print(len(links))
    # return links

if __name__ == '__main__':
    links = get_links()