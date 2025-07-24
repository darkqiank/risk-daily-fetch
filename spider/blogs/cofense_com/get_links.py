from bs4 import BeautifulSoup
from urllib.parse import urljoin


def get_links(_content: str) -> list:
    """
    从给定的 HTML 内容中提取正文中按时间顺序排列的博客文章链接。

    :param _content: 包含博客文章列表的 HTML 字符串。
    :return: 一个包含完整博客文章 URL 的列表。
    """
    base_netloc = "https://cofense.com"
    soup = BeautifulSoup(_content, "html.parser")
    links = []

    # 定位到包含博客文章列表的主内容区域
    main_content = soup.find("div", id="blogs")

    if main_content:
        # 查找该区域内所有的文章链接
        # 链接位于 class 为 "stretched-link" 的 <a> 标签中
        article_links = main_content.find_all("a", class_="stretched-link")

        for link_tag in article_links:
            href = link_tag.get("href")
            if href:
                # 拼接成完整的 URL
                full_link = urljoin(base_netloc, href)
                links.append(full_link)

    return links