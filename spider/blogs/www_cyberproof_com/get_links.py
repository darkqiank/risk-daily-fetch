import bs4
from urllib.parse import urljoin


def get_links(_content: str) -> list:
    """
    从 HTML 内容中提取按时间顺序排列的博客文章链接。
    """
    base_netloc = "https://www.cyberproof.com"
    soup = bs4.BeautifulSoup(_content, "html.parser")

    # 定位包含所有博客文章的特定区域
    # 这个区域的 class 是 "facetwp-template" 并且 data-name 是 "blog"
    articles_container = soup.select_one('div.facetwp-template[data-name="blog"]')

    links = []
    if articles_container:
        # 在该区域内查找所有博客文章的链接
        # 每个博客文章都包含在一个带有 "blog-item" 类的 div 中，链接是其子元素 a 标签
        article_elements = articles_container.select('.blog-item > a')
        for element in article_elements:
            link = element.get('href')
            if link:
                # 拼接成完整的 URL
                if not link.startswith('http'):
                    full_link = urljoin(base_netloc, link)
                else:
                    full_link = link
                links.append(full_link)

    return links