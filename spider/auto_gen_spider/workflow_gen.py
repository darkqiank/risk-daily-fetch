import os
import json
import time

from openai import OpenAI
from pathlib import Path
from fetch_utils import compress_html, detect_content_type
from utils import create_module, run_code, extract_code_block, load_blog_module
from typing import List, Union


client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    base_url=os.environ.get("OPENAI_BASE_URL"),
)
base_model = os.environ.get("OPENAI_BASE_MODEL")

# 代码存储路径
TEMP_DIR = Path("./.generated_code")
TEMP_DIR.mkdir(exist_ok=True)


def call_llm_api(prompt):
    """调用 OpenAI 生成代码"""
    try:
        completion = client.chat.completions.create(
            model=base_model,
            stream=False,
            messages=[
                {"role": "system", "content": "你是数据采集代码助手"},
                {"role": "user", "content": prompt},
            ],
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"API调用失败: {str(e)}"


def gen_parse_directory_code(base_netloc: str, content: str, content_type="html") -> Union[str, None]:

    if content_type == "html":
        """生成提取博客列表的代码"""
        prompt = f"""请根据以下 HTML 片段生成 Python 函数 `get_links`，用于提取正文中按时间顺序排列的博客文章链接：

要求如下：
    - 函数定义：`def get_links(_content: str) -> list:`
    - 设置常量：`base_netloc = {base_netloc}`
    - 仅提取正文中博客文章列表的链接，忽略侧边栏、推荐、标签、多媒体等内容区域的链接
    - 返回值为列表变量 `links = [...]`
    - 链接必须以 `http` 开头；若不是，则用 `urljoin(base_netloc, link)` 拼接为完整 URL
    - 只返回函数的完整 Python 代码，不附带任何解释说明

HTML内容片段：
        {content}..."""
    else:
        prompt = f"""请生成Python代码用于解析以下JSON数据，从中提取正文文章链接列表：
        - 包装在一个函数中，函数名称为get_links, 输入参数为str格式的_content
        - 常量base_netloc为{base_netloc}
        - 从数据结构中提取正文文章链接列表，不要提取多媒体链接
        - 返回格式：links = [...]（使用base_netloc拼接相对链接）
        - JSON内容片段: 
        {content}..."""

    code = call_llm_api(prompt)
    print("大模型输出结果：", code)
    return extract_code_block(code)


def gen_parse_article_code(content: str, content_type="html") -> Union[str, None]:
    """生成提取文章内容的代码"""
    if content_type == "html":
        prompt = f"""请生成Python代码从以下HTML中提取：
        - 文章标题（title）
        - 发布时间（pub_date）（时间格式 YYYY-MM-DD）
        - 正文内容（content）
        要求：
        1. 使用BeautifulSoup解析或者正则代码提取
        2. 包装在一个函数中，函数名称为get_content, 输入参数为str格式的_content
        3. 正文中的文本内容、表格内容，均用回车符进行拼接，保证ioc等内容不粘连
        4. 要考虑不同文章可能结构不一样，减少页面结构依赖，保证代码的通用性和鲁棒性，考虑到各种情况，比如自动构建的class名称可能会变化
        5. 返回字典格式：article = {{...}}
        6. 你的返回只包含代码不要有额外信息
        HTML内容片段：
        {content}..."""
    else:
        prompt = f"""请生成Python代码从以下JSON中提取：
        - 文章标题（title）
        - 发布时间（pub_date）（时间格式 YYYY-MM-DD）
        - 正文内容（content）
        要求：
        1. 包装在一个函数中，函数名称为get_content, 输入参数为str格式的_content
        2. 正文中的文本内容、表格内容，用回车符进行拼接，保证ioc等内容不粘连
        3. 返回字典格式：article = {{...}}
        4. 你的返回只包含代码不要有额外信息
        JSON内容片段：
        {content}..."""

    code = call_llm_api(prompt)
    print("大模型输出结果：", code)
    return extract_code_block(code)


def save_code_to_temp(file_path, code):
    """临时存储解析代码"""
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(code)
    return str(file_path)


def load_code_from_temp(filename):
    """读取临时存储的代码"""
    file_path = TEMP_DIR / filename
    if file_path.exists():
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    return None


def init_module(module_name, url, base_netloc=None, output_dir=TEMP_DIR, fetch="curl_cffi", source_type="html", overwrite=False):
    module_path, module =  create_module(module_name, url, base_netloc, output_dir, fetch, source_type, overwrite)   
    return module_path, module


def gen_links_code_flow(blog_name: str):
    """
        生成博客文章链接：
        1. 获取博客首页HTML
        2. 生成目录解析代码并保存
        3. 执行生成的代码获取文章链接列表
    """
    module = load_blog_module(TEMP_DIR, blog_name)

    def fetch_url(url):
        # 获取内容
        _c = module.fetch_url(url)
        # 获取内容类型
        _c_type = detect_content_type(_c)
        if _c and _c_type == "html":
            _compress_c = compress_html(_c)
            return _c, _c_type, _compress_c
        return _c, _c_type, _c

    _content, _content_type, _compressed_content = fetch_url(module.BASE_URL)
    if not _content:
        print("❌ 获取博客首页失败")
        return None

    dir_code = gen_parse_directory_code(module.BASE_NETLOC , _compressed_content, content_type=_content_type)
    if not dir_code:
        print("❌ 目录解析代码生成失败")
        return None

    # 保存生成的代码供调试和后续复用
    save_code_to_temp(Path(TEMP_DIR) / blog_name / "get_links.py", dir_code)
    links = run_code(dir_code, "get_links", _content=_content)
    print("【目录解析结果】", json.dumps(links, indent=2, ensure_ascii=False))
    return links


def gen_article_code_flow(article_urls: List[str], blog_name: str, delay=5, if_compress=True):
    """
    提取单篇文章内容：
    1. 获取文章HTML
    2. 生成正文解析代码并保存
    3. 执行生成的代码提取文章标题、发布时间和正文内容
    """
    if len(article_urls) == 0:
        print("❌ 请输入至少1条url")
        return None

    module = load_blog_module(TEMP_DIR, blog_name)

    def fetch_url(url):
        # 获取内容
        _c = module.fetch_url(url)
        # 获取内容类型
        _c_type = detect_content_type(_c)
        if _c and _c_type == "html" and if_compress:
            _compress_c = compress_html(_c)
            return _c, _c_type, _compress_c
        return _c, _c_type, _c

    _content, _content_type, _compressed_content = fetch_url(article_urls[0])
    if not _content:
        print("❌ 获取文章页面失败")
        return None

    art_code = gen_parse_article_code(_compressed_content, content_type=_content_type)
    if not art_code:
        print("❌ 正文解析代码生成失败")
        return None

    # 测试代码结果
    articles = []
    article_content = run_code(art_code, "get_content", _content=_content)
    articles.append(article_content)

    for article_url in article_urls[1:]:
        _content, _content_type, _compressed_content = fetch_url(article_url)
        if not _content:
            articles.append({"error": "url未获取到html"})
        article_content = run_code(art_code, "get_content", _content=_content)
        articles.append(article_content)
        time.sleep(delay)

    # 保存生成的代码供调试和后续复用
    save_code_to_temp(Path(TEMP_DIR) / blog_name / "get_content.py", art_code)
    print("【正文解析结果】", json.dumps(articles, indent=2, ensure_ascii=False))
    return articles


if __name__ == "__main__":
    # 运行解析代码生成任务流
    blog_url = "https://www.freebuf.com"
    blog_name = "www_freebuf_com"

    # 初始化
    init_module(blog_name, blog_url, fetch="curl_cffi", base_netloc="https://www.freebuf.com")

    links = gen_links_code_flow(blog_name)

    if len(links) > 0:

        # 选取文章篇数进行解析测试
        # Calculate 1/3 of the links, ensuring it's between 3 and 6
        num_to_select = max(3, min(6, len(links) // 3))
        # Uniformly select articles by stepping through the list
        step = len(links) / num_to_select
        selected_indices = [int(i * step) for i in range(num_to_select)]
        selected_links = [links[i] for i in selected_indices]

        gen_article_code_flow(selected_links, blog_name)
