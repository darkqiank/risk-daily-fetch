import importlib
import prefect
from prefect import flow, task
import sys
from pathlib import Path
import time

from fetch_utils import fetch_url_content


@task
def load_spider(dir, blog_name):
    # 获取隐藏目录的绝对路径
    dir_path = Path(dir).resolve()
    # 将该路径添加到sys.path
    if str(dir_path) not in sys.path:
        sys.path.insert(0, str(dir_path))
    # 导入模块
    module = importlib.import_module(blog_name)
    return module.get_links, module.get_content, module.BASE_URL


@task
def fetch_url_html(url):
    """请求URL获取HTML"""
    html = fetch_url_content(url)
    return html


@task
def fetch_links(get_links, html):
    """获取最新 URL 列表"""
    return get_links(html)


@task
def fetch_content(get_content, html):
    """获取文章内容"""
    return get_content(html)


@task
def store_article(article):
    """存入数据库"""
    pass


@flow
def crawler_flow(dir, blog_name):
    """主爬虫工作流"""
    get_links, get_content, base_url = load_spider(dir, blog_name)
    html = fetch_url_html(base_url)
    urls = fetch_links(get_links, html)

    for url in urls:
        print(url)
        shtml = fetch_url_html(url)
        article = fetch_content(get_content, shtml)
        print(article)
        store_article(article)
        time.sleep(10)


if __name__ == "__main__":
    crawler_flow(".generated_code", "www_freebuf_com")  # 运行 blog1 爬虫
