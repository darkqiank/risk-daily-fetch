from bs4 import BeautifulSoup
from urllib.parse import urljoin

def get_links(_content: str) -> list:
    """
    从给定的 HTML 内容中提取正文部分的博客文章链接。

    Args:
        _content: 包含 HTML 内容的字符串。

    Returns:
        一个按时间顺序排列的博客文章链接列表。
    """
    base_netloc = "https://www.freebuf.com"
    soup = BeautifulSoup(_content, "html.parser")
    
    # 定位到包含文章列表的主容器
    article_list_container = soup.select_one('div.article-list')
    if not article_list_container:
        return []

    links = []
    seen_links = set()

    # 遍历容器内每个文章项目
    article_items = article_list_container.select('div.article-item')
    
    for item in article_items:
        # 每个项目中的主要链接通常在标题部分
        link_tag = item.select_one('div.title-view a')
        
        if link_tag and link_tag.has_attr('href'):
            href = link_tag['href']
            # 使用 urljoin 确保链接是完整的绝对 URL
            full_link = urljoin(base_netloc, href)
            
            # 避免重复添加链接，同时保持顺序
            if full_link not in seen_links:
                links.append(full_link)
                seen_links.add(full_link)
                
    return links