from utils import load_blog_module
from fetch_utils import compress_html


def fetch_url_html(fetch_url, url):
    """请求URL获取HTML"""
    return fetch_url(url)


def fetch_links(get_links, html):
    """获取最新 URL 列表"""
    return get_links(html)


def fetch_content(get_content, html):
    """获取文章内容"""
    return get_content(html)


def store_links(blog_name, _links):
    """存入数据库"""
    pass


def store_articles(blog_name, _articles):
    """存入数据库"""
    pass


def crawler_links_flow(m_dir, blog_name):
    """爬取urlist工作流"""
    module = load_blog_module(m_dir, blog_name)
    html = fetch_url_html(module.fetch_url, module.BASE_URL)
    # with open(f".generated_code/debug_{blog_name}.html", "w", encoding='utf-8') as f:
    #     f.write(compress_html(html))
    _links = fetch_links(module.get_links, html)
    store_links(blog_name, _links)
    return _links


def crawler_article_flow(m_dir, blog_name, _links):
    """爬取article工作流"""
    module = load_blog_module(m_dir, blog_name)
    articles = []
    for _link in _links:
        html = fetch_url_html(module.fetch_url, _link)
        with open(f".generated_code/debug_{blog_name}.html", "w", encoding='utf-8') as f:
            f.write(html)
        data = fetch_content(module.get_content, html)
        articles.append({"link": _link, "data": data})
    store_articles(blog_name, articles)
    return articles


if __name__ == "__main__":
    links = crawler_links_flow(".generated_code", "www_recordedfuture_com_intelligence_reports")  # 运行 blog1 爬虫
    print(links)
    if links:
        art = crawler_article_flow(".generated_code", "www_recordedfuture_com_intelligence_reports", [links[0]])
        print(art)
