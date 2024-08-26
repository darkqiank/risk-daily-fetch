from curl_cffi import requests
from bs4 import BeautifulSoup


def get_links():
    url = 'https://cybersecurity.att.com/blogs/'
    response = requests.get(url, impersonate="chrome")
    soup = BeautifulSoup(response.text, 'html.parser')
    items = soup.find_all('div', class_="blog-card-cta")

    links = []
    # 打印所有链接
    for item in items:
        a = item.findNext('a')
        link = f"https://cybersecurity.att.com{a['href']}"
        links.append(link)
    print(links)
    return links

