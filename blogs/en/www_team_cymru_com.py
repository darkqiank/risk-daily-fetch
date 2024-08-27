import requests
import re

def get_links():
    # 目标URL
    url = 'https://www.team-cymru.com/blog'

    # 发送HTTP请求
    response = requests.get(url, timeout=20)
    response.encoding = 'utf-8'  # 设置编码

    # 获取网页文本
    web_text = response.text
    # 正则表达式模式
    pattern = r'href="(https://www\.team-cymru\.com/post/[^"]+)"'

    # 查找所有匹配的链接
    links = re.findall(pattern, web_text)

    # 打印所有链接
    print(links)
    return links


