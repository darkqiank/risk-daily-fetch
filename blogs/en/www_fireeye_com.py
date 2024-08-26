import requests

def get_links():
    # 目标URL
    url = 'https://www.trellix.com/corpcomsvc/getRecentBlogsFromWarpper?blogsCount=5'

    # 发送HTTP请求
    response = requests.get(url)

    print(response.json())
    # 查找所有文章链接
    items = response.json().get("SearchResult")

    links = []

    # 打印所有链接
    for item in items:
        link = item.get('url')
        links.append(link)

    print(links)
    return links


