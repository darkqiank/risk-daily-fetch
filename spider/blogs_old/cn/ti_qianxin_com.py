import requests
import re
import os


def get_links(use_proxy=False):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxies = {"http": proxy_url, "https": proxy_url} if proxy_url and use_proxy else None

    # 目标URL
    url = 'https://ti.qianxin.com/blog/'

    # 发送HTTP请求
    response = requests.get(url, proxies=proxies, timeout=20)
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