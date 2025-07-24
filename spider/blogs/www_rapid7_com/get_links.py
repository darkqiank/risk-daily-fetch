# import re
# import json
# from urllib.parse import urljoin

# def get_links(_content: str) -> list:
#     """
#     从给定的 HTML 内容中提取按时间顺序排列的博客文章链接。
#     """
#     base_netloc = 'https://www.rapid7.com'
#     links = []

#     # 使用正则表达式查找嵌入在脚本标签中的博客文章JSON数据
#     # 该数据通常位于一个名为 "hits" 的键中
#     match = re.search(r'\\"hits\\":(\[.*?\]),\\"nextPage\\":', _content, re.DOTALL)

#     if match:
#         print(111)
#         # 提取匹配到的JSON字符串
#         hits_json_str = match.group(1)
#         try:
#             hits_json_str.replace('\\"', '"')
#             # 解析JSON数据
#             articles = json.loads(hits_json_str)
            
#             # 遍历文章列表并提取URL
#             for article in articles:
#                 if 'url' in article and isinstance(article['url'], str):
#                     relative_link = article['url']
#                     # 拼接成完整的URL
#                     full_link = urljoin(base_netloc, relative_link)
#                     links.append(full_link)
#         except json.JSONDecodeError:
#             # 如果JSON解析失败，则不执行任何操作，返回空列表
#             pass
            
#     return links

import re
from urllib.parse import urljoin

def get_links(_content: str) -> list:
    """
    从给定的 HTML 内容中提取按时间顺序排列的博客文章链接。
    提取 "hits" 和 "nextPage" 之间的内容，然后用正则找出所有 URL 字段。
    """
    base_netloc = 'https://www.rapid7.com'
    links = []

    # 提取 hits 和 nextPage 之间的内容（非贪婪匹配）
    match = re.search(r'\\"hits\\":\s*(\[.*?\])\s*,\\"nextPage\\"', _content, re.DOTALL)
    if match:
        print(1111)
        hits_block = match.group(1)
        # print(hits_block)
        # 使用正则提取所有 url 字段（字符串形式）
        url_matches = re.findall(r'\\"url\\":\\"(\/blog\/post\/[^"]+)\\"', hits_block)
        for relative_url in url_matches:
            full_url = urljoin(base_netloc, relative_url)
            links.append(full_url)

    return links
