import os
import json
import requests
import re
from bs4 import BeautifulSoup
from openai import OpenAI
from prefect import flow, task
from prefect.task_runners import ConcurrentTaskRunner
from pathlib import Path
from template import create_module
from fetch_utils import fetch_url_content, compress_html

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    base_url=os.environ.get("OPENAI_BASE_URL"),
)
base_model = os.environ.get("OPENAI_BASE_MODEL")

# 代码存储路径
TEMP_DIR = Path("./.generated_code")
TEMP_DIR.mkdir(exist_ok=True)


@task
def fetch_url_html(url):
    """请求URL获取HTML"""
    html = fetch_url_content(url)
    if html:
        compressed_html = compress_html(html)
        return html, compressed_html
    else:
        return None, None


@task
def call_llm_api(prompt):
    """调用 OpenAI 生成代码"""
    try:
        completion = client.chat.completions.create(
            model=base_model,
            messages=[
                {"role": "system", "content": "你是数据采集代码助手"},
                {"role": "user", "content": prompt},
            ],
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"API调用失败: {str(e)}"


@task
def gen_parse_directory_code(url, html):
    """生成提取博客列表的代码"""
    prompt = f"""请生成Python代码用于解析以下HTML，从中提取正文文章链接列表：
    - 包装在一个函数中，函数名称为get_links, 输入参数为html_content
    - 常量base_url为{url}
    - 只提取博客文章列表的所有文章链接，不要提取其他额外的链接
    - 函数返回格式：links = [...] 的Python列表, 判断link是否是http开头，若不是则使用base_url进行拼接
    - 你的返回只包含代码不要有额外信息
    HTML内容片段：
    {html}..."""

    code = call_llm_api(prompt)
    match = re.search(r'```python\n(.*?)\n```', code, re.DOTALL)
    return match.group(1) if match else None


@task
def gen_parse_article_code(html):
    """生成提取文章内容的代码"""
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
    {html}..."""

    code = call_llm_api(prompt)
    match = re.search(r'```python\n(.*?)\n```', code, re.DOTALL)
    return match.group(1) if match else None


@task
def run_code(code, func_name, arg1):
    """执行代码并调用函数"""
    namespace = {}
    exec(code, namespace)
    return namespace[func_name](arg1) if func_name in namespace else {"error": "执行失败"}


@task
def save_code_to_temp(file_path, code):
    """临时存储解析代码"""
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(code)
    return str(file_path)


@task
def load_code_from_temp(filename):
    """读取临时存储的代码"""
    file_path = TEMP_DIR / filename
    if file_path.exists():
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    return None


@flow(task_runner=ConcurrentTaskRunner())
def code_generation_flow(blog_url: str, blog_name: str):
    """Prefect 3 解析代码生成 & 测试任务流"""

    # 在临时目录创建模块
    module_path = create_module(blog_name, blog_url, TEMP_DIR)

    links = None
    html, compressed_html = fetch_url_html(blog_url)
    if not html:
        print("❌ 获取网页失败")
        return

    # 生成 & 存储目录解析代码
    dir_code = gen_parse_directory_code(blog_url, compressed_html)
    if dir_code:
        save_code_to_temp(module_path / "get_links.py", dir_code)
        links = run_code(dir_code, "get_links", compressed_html)
        print("【目录解析结果】", json.dumps(links, indent=2, ensure_ascii=False))
    else:
        print("❌ 目录解析失败")

    if links:
        sample_html, compressed_sample_html = fetch_url_html(links[0])
        if sample_html:
            # 生成 & 存储文章解析代码
            art_code = gen_parse_article_code(compressed_sample_html)
            if art_code:
                save_code_to_temp(module_path / "get_content.py", art_code)
                article_content = run_code(art_code, "get_content", sample_html)
                print("【正文解析结果】", json.dumps(article_content, indent=2, ensure_ascii=False))
    else:
        print("❌ 正文解析失败")


if __name__ == "__main__":
    # 运行解析代码生成任务流
    code_generation_flow("https://www.freebuf.com", "www_freebuf_com")
