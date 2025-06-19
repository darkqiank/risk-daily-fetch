import requests
import os


def get_links(use_proxy=False):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxies = {"http": proxy_url, "https": proxy_url} if proxy_url and use_proxy else None

    url = 'https://cert.360.cn/report/searchbypage?length=10&start=0'
    response = requests.get(url, proxies=proxies, timeout=20)
    datas = response.json().get("data", [])
    links = []
    for data in datas:
        link = f"https://cert.360.cn/report/detail?id={data.get('id')}"
        links.append(link)
    print(links)
    return links
