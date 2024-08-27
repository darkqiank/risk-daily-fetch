import requests


def get_links():
    url = 'https://cert.360.cn/report/searchbypage?length=10&start=0'
    response = requests.get(url, timeout=20)
    datas = response.json().get("data", [])
    links = []
    for data in datas:
        link = f"https://cert.360.cn/report/detail?id={data.get('id')}"
        links.append(link)
    print(links)
    return links
