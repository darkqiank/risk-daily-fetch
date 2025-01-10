from curl_cffi import requests
from bs4 import BeautifulSoup


def get_links():
    # 目标URL
    url = 'https://www.seqrite.com/blog/'

    # 发送HTTP请求
    response = requests.get(url, impersonate="chrome", timeout=20)
    response.encoding = 'utf-8'  # 设置编码

    # print(response.text)
    # 解析HTML
    soup = BeautifulSoup(response.text, 'html.parser')

    # 查找所有文章链接
    articles = soup.find_all('h2', class_="title home-post-title entry-title")

    links = []

    # 打印所有链接
    for article in articles:
        a = article.findNext('a')
        link = a['href']
        if link not in links:
            links.append(link)
    print(links)
    return links

if __name__ == '__main__':
    links = get_links()
