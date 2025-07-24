import bs4
from urllib.parse import urljoin


def get_links(_content: str) -> list:
    """
    从给定的 HTML 内容中提取正文中按时间顺序排列的博客文章链接。
    """
    base_netloc = "https://citizenlab.ca"
    soup = bs4.BeautifulSoup(_content, 'html.parser')
    links = []

    # 定位到包含“Latest Research”的特定区域
    latest_research_section = soup.find('section', id='latestresearch')

    if latest_research_section:
        # 在该区域内查找所有的文章条目
        article_tags = latest_research_section.find_all('article', class_='article__preview')
        
        for article in article_tags:
            # 提取每个文章标题中的链接
            header = article.find('header')
            if header:
                link_tag = header.find('a')
                if link_tag and 'href' in link_tag.attrs:
                    link = link_tag['href']
                    # 确保链接是完整的 URL
                    if not link.startswith('http'):
                        full_link = urljoin(base_netloc, link)
                    else:
                        full_link = link
                    links.append(full_link)
    
    return links