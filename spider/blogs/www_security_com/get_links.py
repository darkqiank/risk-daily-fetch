from urllib.parse import urljoin
from bs4 import BeautifulSoup

def get_links(_content: str) -> list:
    base_netloc = "https://www.security.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    main_content = soup.find('main', class_='main__content')
    if main_content:
        for article in main_content.find_all('article', class_='blog-post-teaser'):
            link = article.find('a', class_='blog-post-teaser__link-wrapper')
            if link and link.get('href'):
                href = link['href']
                if not href.startswith('http'):
                    href = urljoin(base_netloc, href)
                if href not in links:
                    links.append(href)
    
    return links