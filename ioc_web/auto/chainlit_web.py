import os
import requests
import json
import re
from bs4 import BeautifulSoup
from openai import OpenAI
import chainlit as cl

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    base_url=os.environ.get("OPENAI_BASE_URL"),
)
base_model = os.environ.get("OPENAI_BASE_MODEL")


def compress_text(text, max_length):
    words = text.split()
    return text if len(words) <= max_length else ' '.join(words[:max_length]) + '...'


def compress_html(html, max_length=10000):
    soup = BeautifulSoup(html, 'html.parser')
    for tag in soup(['script', 'style', 'noscript', 'meta', 'svg']):
        tag.decompose()
    text_nodes = soup.find_all(text=True)
    total_length = sum(len(node) for node in text_nodes)
    if total_length > max_length:
        ratio = max_length / total_length
        for node in text_nodes:
            node.replace_with(compress_text(node, int(len(node) * ratio)))
    return str(soup)


def call_llm_api(prompt):
    try:
        completion = client.chat.completions.create(
            model=base_model,
            messages=[
                {"role": "system", "content": "你是数据采集器代码生成助手"},
                {"role": "user", "content": prompt},
            ],
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"API调用失败: {str(e)}"


def fetch_url_html(url):
    try:
        response = requests.get(url)
        response.raise_for_status()
        html = response.text
        compressed_html = compress_html(response.text)
        return html, compressed_html
    except Exception as e:
        print(f"目录页获取失败: {str(e)}")
        return None, None


def gen_parse_directory_code(url, html):
    prompt = f"""请生成Python代码用于解析以下HTML，提取博客文章链接列表：
    - 函数名: get_links(html_content)
    - 只提取博客文章链接，返回Python列表
    - 若link不是http开头，使用base_url {url} 拼接
    - 你的返回只包含代码，不要有额外信息
    HTML内容:
    {html}..."""

    code = call_llm_api(prompt)
    if not code:
        return False, {"error": "生成代码失败"}

    match = re.search(r'```python\n(.*?)\n```', code, re.DOTALL)
    if not match:
        return False, {"error": "未找到代码块"}

    return True, match.group(1)


def gen_parse_article_code(url, html):
    prompt = f"""请生成Python代码从HTML提取:
    - 文章标题(title), 发布时间(pub_date), 正文内容(content)
    - 使用BeautifulSoup解析，函数名 get_content(html_content)
    - 返回格式: article = {{'title': ..., 'pub_date': ..., 'content': ...}}
    - 你的返回只包含代码，不要有额外信息
    HTML:
    {html}..."""

    code = call_llm_api(prompt)
    if not code:
        return False, {"error": "生成代码失败"}

    match = re.search(r'```python\n(.*?)\n```', code, re.DOTALL)
    if not match:
        return False, {"error": "未找到代码块"}

    return True, match.group(1)


def run_code(code, func_name, arg1):
    namespace = {}
    exec(code, namespace)
    return namespace[func_name](arg1) if func_name in namespace else {"error": "代码执行失败"}


async def show_processing_step(label):
    step = cl.Step(name=label, type="run")
    await step.send()
    return step


async def complete_step(step, result=None):
    step.output = result or "完成"
    step.type = "complete"
    await step.update()


@cl.on_chat_start
async def start():
    await cl.Message("欢迎使用网页解析工具！输入博客目录URL或文章URL进行解析。").send()


@cl.on_message
async def handle_message(message: cl.Message):
    url = message.content.strip()
    if not url.startswith("http"):
        await cl.Message("请输入有效的URL！").send()
        return

    # 保存URL到会话状态
    cl.user_session.set("current_url", url)

    # 创建操作选择
    actions = [
        cl.Action(name="parse_directory", icon="mouse-pointer-click",
                  payload={"value": "dir"}, label="解析目录页"),
        cl.Action(name="parse_article", icon="mouse-pointer-click",
                  payload={"value": "article"}, label="解析文章内容")
    ]

    await cl.Message(
        content="请选择要执行的操作：",
        actions=actions
    ).send()


@cl.action_callback("parse_directory")
async def on_action_parse_directory(action: cl.Action):
    url = cl.user_session.get("current_url")
    html, compressed_html = fetch_url_html(url)
    if html:
        success, code = gen_parse_directory_code(url, compressed_html)
        await cl.Message(f"【目录解析】大模型返回的代码：\n```python\n{code}\n```").send()
        if success:
            links = run_code(code,"get_links", compressed_html)
            await cl.Message(f"【目录解析】解析结果：\n{json.dumps(links, indent=2, ensure_ascii=False)}").send()
    return


@cl.action_callback("parse_article")
async def on_action_parse_article(action: cl.Action):
    url = cl.user_session.get("current_url")
    html, compressed_html = fetch_url_html(url)
    if html:
        success, code = gen_parse_article_code(url, compressed_html)
        await cl.Message(f"【正文解析】大模型返回的代码：\n```python\n{code}\n```").send()
        if success:
            content = run_code(code,"get_content", html)
            await cl.Message(f"【正文解析】解析结果：\n{json.dumps(content, indent=2, ensure_ascii=False)}").send()
    return

