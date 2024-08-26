import requests
import re


def get_links():
    # 目标URL
    url = 'https://ti.qianxin.com/blog/'

    # 发送HTTP请求
    response = requests.get(url)
    response.encoding = 'utf-8'  # 设置编码

    # 获取网页文本
    web_text = response.text
    # 正则表达式模式
    pattern = r'permlink:"(https://ti\.qianxin\.com/blog/articles/[^"]+)"'


    # 查找所有匹配的链接
    links = re.findall(pattern, web_text)

    # 打印所有链接
    print(len(links))
    return links