from bs4 import BeautifulSoup
from urllib.parse import urljoin

def get_links(_content: str) -> list:
    """
    从给定的 HTML 内容中提取正文中按时间顺序排列的博客文章链接。
    """
    base_netloc = "https://www.threatray.com"
    soup = BeautifulSoup(_content, 'html.parser')
    
    links = []
    
    # 定位包含博客文章列表的父容器
    # class 'blog_grid' 是包含所有博客文章卡片的直接容器
    blog_list_container = soup.find('div', class_='blog_grid')
    
    if blog_list_container:
        # 在容器内查找所有的文章链接
        # 文章链接的 <a> 标签具有 'media-card' class
        article_elements = blog_list_container.find_all('a', class_='media-card', href=True)
        
        for element in article_elements:
            link = element['href']
            # 使用 urljoin 确保链接是完整的绝对 URL
            full_link = urljoin(base_netloc, link)
            links.append(full_link)
            
    return links