from bs4 import BeautifulSoup
from urllib.parse import urljoin

def get_links(_content: str) -> list:
    """
    从给定的 HTML 内容中提取按时间顺序排列的博客文章链接。
    """
    base_netloc = 'https://www.catonetworks.com'
    soup = BeautifulSoup(_content, 'html.parser')
    links = []

    # 1. 提取置顶的"Featured"文章链接
    featured_article = soup.find('article', class_='new-article-primary--featured')
    if featured_article:
        link_tag = featured_article.find('a', class_='article-primary__link')
        if link_tag and link_tag.get('href'):
            full_link = urljoin(base_netloc, link_tag['href'])
            links.append(full_link)

    # 2. 提取正文中的博客文章列表
    articles_section = soup.find('section', class_='new-section-articles')
    if articles_section:
        article_cards = articles_section.find_all('div', class_='new-article-card')
        for card in article_cards:
            title_tag = card.find('h2', class_='new-article-card__title')
            if title_tag:
                link_tag = title_tag.find('a')
                if link_tag and link_tag.get('href'):
                    full_link = urljoin(base_netloc, link_tag['href'])
                    # 避免重复添加（以防置顶文章也出现在列表中）
                    if full_link not in links:
                        links.append(full_link)

    return links[:20]