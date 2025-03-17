from bs4 import BeautifulSoup
from curl_cffi import requests

def get_secrss_links():
    url = 'https://www.secrss.com'
    response = requests.get(url, impersonate="chrome110", timeout=20)
    soup = BeautifulSoup(response.text, 'html.parser')

    # 定位文章列表容器
    article_list = soup.find('ul', {'id': 'article-list'})

    links = []
    # 提取所有列表项中的文章链接
    for item in article_list.find_all('li', class_='list-item'):
        link_tag = item.find('h2', class_='title').find('a')
        if link_tag and link_tag.has_attr('href'):
            links.append(link_tag['href'])

    print(f"Found {len(links)} articles:")
    for link in links:
        print(link)
    return links


if __name__ == "__main__":
    get_secrss_links()