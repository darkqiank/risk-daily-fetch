from curl_cffi import requests
from bs4 import BeautifulSoup
import os
import json

def get_links(use_proxy=False):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxies = {"http": proxy_url, "https": proxy_url} if proxy_url and use_proxy else None

    # 目标URL
    url = 'https://cyble.com/blog/?ucfrontajaxaction=getfiltersdata&layoutid=29234&elid=a3b899f&addelids=28aebe7'

    # 请求头部
    headers = {
        'accept': '*/*',
        'referer': 'https://cyble.com/blog/',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36',
        'x-requested-with': 'XMLHttpRequest'
    }

    # 发送HTTP请求
    response = requests.get(
        url,
        headers=headers,
        proxies=proxies,
        impersonate="chrome",
        timeout=20
    )
    response.encoding = 'utf-8'

    # 解析JSON响应
    res = response.json()
    html_content = res.get('html_items', '')

    # 解析HTML内容
    soup = BeautifulSoup(html_content, 'html.parser')

    # 查找所有文章链接
    post_divs = soup.find_all('div', class_='uc_post_list_image')
    
    links = []
    for div in post_divs:
        link = div.find('a')
        if link and link.get('href'):
            links.append(link['href'])

    print(links)
    return links


