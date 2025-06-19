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


def compress_html(html, max_length=200000):
    """压缩 HTML 内容，去除指定标签，并限制整体长度"""
    soup = BeautifulSoup(html, 'html.parser')

    # 删除不需要的标签
    for tag in soup(['script', 'style', 'noscript', 'meta', 'svg']):
        tag.decompose()
    
    # 首次检查压缩后的长度
    compressed_html = str(soup)
    if len(compressed_html) <= max_length:
        return compressed_html
    
    # 如果仍然超过长度限制，进一步压缩文本内容
    text_nodes = soup.find_all(text=True)
    total_text_length = sum(len(node) for node in text_nodes)
    
    # 如果文本总长度为0，无法压缩
    if total_text_length == 0:
        return compressed_html[:max_length]
    
    # 计算需要的压缩比例
    current_length = len(compressed_html)
    # 估算标签和属性占用的长度
    markup_length = current_length - total_text_length
    # 计算文本需要压缩到的目标长度
    target_text_length = max(0, max_length - markup_length)
    
    # 计算压缩比例
    compression_ratio = target_text_length / total_text_length
    
    # 压缩每个文本节点
    for node in text_nodes:
        if len(node.strip()) > 0:  # 只处理非空文本节点
            target_node_length = max(1, int(len(node) * compression_ratio))
            node.replace_with(compress_text(node, target_node_length))
    
    result = str(soup)
    
    # # 最后检查，如果仍然超过限制，进行截断
    # if len(result) > max_length:
    #     return result[:max_length]
    
    return result


def detect_content_type(content: str) -> str:
    """检测内容类型，返回'html'或'json'"""
    try:
        json.loads(content)
        return "json"
    except json.JSONDecodeError:
        return "html"