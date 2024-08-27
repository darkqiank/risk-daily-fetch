import requests
from bs4 import BeautifulSoup

def get_links():
    # 目标URL
    url = 'https://www.volexity.com/wp-admin/admin-ajax.php?action=alm_get_posts&query_type=standard&id=&post_id=0&slug=home&canonical_url=https%253A%252F%252Fwww.volexity.com%252Fblog%252F&posts_per_page=5&page=0&offset=0&post_type=post&repeater=default&seo_start_page=1&order=DESC&orderby=date'

    # 发送HTTP请求
    response = requests.get(url, timeout=20)
    res = response.json()
    html = res.get('html')
    # print(response.text)
    # 解析HTML
    soup = BeautifulSoup(html, 'html.parser')

    # 查找所有文章链接
    items = soup.find_all('a', class_="box-cta")

    links = []

    # 打印所有链接
    for item in items:
        links.append(item['href'])

    print(links)
    return links


