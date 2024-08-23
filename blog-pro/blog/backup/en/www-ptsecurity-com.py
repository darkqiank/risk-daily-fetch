import requests


def get_links():
    # 目标URL
    url = 'https://www.ptsecurity.com/ww-en/ajax/getListing.php?page=1&type=analytics'

    # 发送HTTP请求
    response = requests.get(url)
    response.encoding = 'utf-8'  # 设置编码

    res = response.json()
    listing = res["listing"]

    links = []
    for item in listing:
        links.append(f'https://www.ptsecurity.com{item["link"]}')
    print(links)
    return links

get_links()
