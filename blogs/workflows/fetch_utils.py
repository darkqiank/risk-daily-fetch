from bs4 import BeautifulSoup
from template import FETCH_TEMPLATES
from utils import run_code
import json

def fetch_url(url, fetch="default"):
    """请求URL获取HTML"""
    fetch_code = FETCH_TEMPLATES.get(fetch)
    if fetch_code:
        html = run_code(fetch_code, "fetch_url", url)
        if html:
            return html
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


def detect_content_type(content: str) -> str:
    """检测内容类型，返回'html'或'json'"""
    try:
        json.loads(content)
        return "json"
    except json.JSONDecodeError:
        return "html"