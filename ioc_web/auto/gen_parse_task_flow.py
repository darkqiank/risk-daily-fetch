import requests
import json
import re
from bs4 import BeautifulSoup
import os
from openai import OpenAI

client = OpenAI(
    api_key = os.environ.get("OPENAI_API_KEY"),
    base_url = os.environ.get("OPENAI_BASE_URL"),
)

base_model=os.environ.get("OPENAI_BASE_MODEL")


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


def call_llm_api(prompt):
    """调用大模型API"""
    try:
        completion = client.chat.completions.create(
            model=base_model,  # your model endpoint ID
            messages=[
                {"role": "system", "content": "你是数据采集器代码生成助手"},
                {"role": "user", "content": prompt},
            ],
        )
        return completion.choices[0].message.content
    except Exception as e:
        print(f"API调用失败: {str(e)}")
        return None


# ================= 目录解析模块 =================
def parse_directory(url):
    """解析目录页获取文章链接"""
    # 1. 获取原始HTML
    try:
        response = requests.get(url)
        response.raise_for_status()
        response.encoding = 'utf-8'  # 设置编码
        html = response.text
        html = compress_html(html)
        print(html)
    except Exception as e:
        print(f"目录页获取失败: {str(e)}")
        return []

    # 2. 生成提取代码
    prompt = f"""请生成Python代码用于解析以下HTML，从中提取正文文章链接列表：
    - 包装在一个函数中，函数名称为get_links, 输入参数为html_content
    - 常量base_url为{url}
    - 只提取博客文章链接
    - 函数返回格式：links = [...] 的Python列表, 判断link是否是http开头，若不是则使用base_url进行拼接
    - 你的返回只包含代码不要有额外信息
    HTML内容片段：
    {html}..."""  # 截取部分内容防止token超标

    code = call_llm_api(prompt)
    if not code:
        return []
    pattern = r'```(?:python)?\n(.*?)\n```'
    match = re.search(pattern, code, re.DOTALL)
    if match:
        code_block = match.group(1).strip()
        print(code_block)
        # 3. 执行生成的代码
        try:
            namespace = {}
            exec(code_block, namespace)  # 执行代码
            if 'get_links' in namespace:
                links = namespace['get_links'](html)  # 调用 get_links 函数
                print("Extracted Links:", links)
                return links
        except Exception as e:
            print(f"链接提取代码执行失败: {str(e)}")
            return []
    else:
        return []


# ================= 正文解析模块 =================
def parse_article(url):
    """解析文章内容"""
    # 1. 获取原始HTML
    try:
        response = requests.get(url)
        response.raise_for_status()
        html = response.text
        compressed_html = compress_html(html)
    except Exception as e:
        print(f"文章页获取失败: {str(e)}")
        return {}

    # 2. 生成提取代码
    prompt = f"""请生成Python代码从以下HTML中提取：
    - 文章标题（title）
    - 发布时间（pub_date）
    - 正文内容（content）
    要求：
    1. 使用BeautifulSoup解析
    2. 包装在一个函数中，函数名称为get_content, 输入参数为html_content
    3. 返回字典格式：article = {{...}}
    4. 你的返回只包含代码不要有额外信息
    HTML内容片段：
    {compressed_html}..."""

    code = call_llm_api(prompt)
    if not code:
        return {}
    pattern = r'```(?:python)?\n(.*?)\n```'
    match = re.search(pattern, code, re.DOTALL)
    if match:
        code_block = match.group(1).strip()
        print(code_block)
        # 3. 执行生成的代码
        try:
            namespace = {}
            exec(code_block, namespace)  # 执行代码
            if 'get_content' in namespace:
                _article = namespace['get_content'](html)  # 调用 get_content 函数
                print("Extracted content success!")
                return _article
        except Exception as e:
            print(f"链接提取代码执行失败: {str(e)}")
    return {}


# ================= 使用示例 =================
if __name__ == "__main__":
    # 目录解析示例
    directory_url = "https://www.anquanke.com/"
    article_links = parse_directory(directory_url)
    print(f"发现 {len(article_links)} 篇文章")

    # article_link = "https://www.anquanke.com/post/id/305690"
    # # 正文解析示例
    # article = parse_article(article_link)
    # print(json.dumps(article, indent=2, ensure_ascii=False))