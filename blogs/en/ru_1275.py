import requests
from curl_cffi import requests
from bs4 import BeautifulSoup


def get_links():
    # 目标URL
    base_url = "https://1275.ru/ioc"

    # 发送HTTP请求
    response = requests.get(base_url, impersonate="chrome", timeout=20)
    response.encoding = 'utf-8'  # 设置编码

    # print(response.text)
    # 解析HTML
    soup = BeautifulSoup(response.text, 'html.parser')
    links = []

    for article in soup.find_all('article', class_='post-card'):
        link_tag = article.find('h2', class_='post-card__title').find('a')
        if link_tag and 'href' in link_tag.attrs:
            link = link_tag['href']
            if not link.startswith('http'):
                link = base_url + link if link.startswith('/') else base_url + '/' + link
            links.append(link)

    return links


