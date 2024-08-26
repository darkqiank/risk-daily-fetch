from bs4 import BeautifulSoup
from curl_cffi import requests


def get_links():
    url = 'https://ti.dbappsecurity.com.cn/blog/'
    response = requests.get(url, impersonate="chrome")

    soup = BeautifulSoup(response.text, 'html.parser')
    items = soup.find_all('h2', class_="entry-title")

    links = []
    # 打印所有链接
    for item in items:
        a = item.findNext('a')
        link = a['href']
        links.append(link)
    print(links)
    return links
