import requests
from bs4 import BeautifulSoup


def fetch_url_content(url):
    """请求URL获取HTML"""
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"获取失败: {str(e)}")
        return None


def compress_text(text, max_length):
    """智能压缩文本内容，优先保留关键词"""
    words = text.split()
    if len(words) <= max_length:
        return text
    return ' '.join(words[:max_length]) + '...'


def compress_html(html, max_length=10000):
    """压缩 HTML 内容，去除指定标签，并限制整体长度"""
    soup = BeautifulSoup(html, 'html.parser')

    # 删除不需要的标签
    for tag in soup(['script', 'style', 'noscript', 'meta', 'svg']):
        tag.decompose()

    # 获取所有文本节点并计算总长度
    text_nodes = soup.find_all(text=True)
    total_length = sum(len(node) for node in text_nodes)

    # 计算压缩比例
    if total_length > max_length:
        ratio = max_length / total_length
        for node in text_nodes:
            node.replace_with(compress_text(node, int(len(node) * ratio)))

    return str(soup)