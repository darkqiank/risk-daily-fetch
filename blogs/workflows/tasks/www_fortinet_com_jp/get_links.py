from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.fortinet.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # 提取正文文章列表中的链接
    blog_list = soup.find('section', class_='b3-blog-list')
    if blog_list:
        for article in blog_list.find_all('div', class_='b3-blog-list__post'):
            # 从标题中提取链接
            title_link = article.find('h2', class_='b3-blog-list__title').find('a')['href']
            if title_link:
                if not title_link.startswith('http'):
                    title_link = base_netloc + title_link
                links.append(title_link)
            
            # 从图片中提取链接（可能与标题链接相同）
            img_link = article.find('div', class_='b3-blog-list__background').find('a')['href']
            if img_link:
                if not img_link.startswith('http'):
                    img_link = base_netloc + img_link
                if img_link not in links:  # 避免重复添加
                    links.append(img_link)
    
    return links