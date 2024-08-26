import requests
from curl_cffi import requests
import re

def get_links():
    # 目标URL
    url = 'https://www.forcepoint.com/blog?page=1'

    # 发送HTTP请求
    response = requests.get(url, impersonate="chrome")
    response.encoding = 'utf-8'  # 设置编码

    # print(response.text)

    # 获取网页文本
    web_text = response.text
    # 正则表达式模式
    pattern = r'"page_url":"(/blog/[^"]+)"'

    # 查找所有匹配的链接
    items = re.findall(pattern, web_text)

    links = []
    # 打印所有链接
    for item in items:
        links.append(f"https://www.forcepoint.com{item}")
    print(links)
    return links

