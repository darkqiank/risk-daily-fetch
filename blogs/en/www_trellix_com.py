from curl_cffi import requests
from bs4 import BeautifulSoup

def get_links():
    # 目标URL
    url = 'https://www.trellix.com/blogs/'
    headers = {
        'Cookie': 'ak_bmsc=B612C0315EB59CE58DDA566CC39BE8DD~000000000000000000000000000000~YAAQfiLHFwHEBiGRAQAAhQ2+VRiLIkt+/GOGdUwQErVN6Isllt77lW+2wzoT7Ss+Zem29LFYV4sX/Y8hn8CospCcNKBjqEsU+t15WhrFtbc6WxLKxXE33tkBAjXf+g1Nsne/uszpU1BBXb1QT4OUGKuhtwM9c/+rAF07isAtXK8cgztJuSMEYPSBkE7zuLuwO/rOGvqrj9MnLp5kimgA2RmGhFcbFA3q6G+vwDx1VAHUS+9LM9szdu5tz5BnGaVYQ5rLPg5IL1o4H3OIN62wHq3EALQxrWCQ3q/S+tWHbjvrgVTNytb4BJ0U9pCAieIInHHRsuEDmabPjQWQeG9j4Qdt0AVC0+jH7bbFWM8ffes89R6t+/ubqQfone1/RgdYyhUreZ+mGpTT/TeIzoV9gKrpz2ppwYraCMX3zQmWRZJS/CG/OkM2KGQQrmARbjmlkQb63hbV8O2IYGnHR8yvzprIbW7IwmrA02CkT/w3dC8vwZIxfM3w4YANXRsOvukiI1tyf6uOyiwcWm14DFGMdFcy/ZIpxw=='
    }
    # 创建一个session
    session = requests.Session()

    response = session.get(url, impersonate="chrome", headers=headers)
    response.encoding = 'utf-8'  # 设置编码

    # print(response.text)
    # 解析HTML
    soup = BeautifulSoup(response.text, 'html.parser')

    # 查找所有文章链接
    items = soup.find_all('a', class_="link-arrow")

    links = []

    # 打印所有链接
    for item in items:
        links.append(f"https://www.trellix.com{item['href']}")

    print(links)
    return links


