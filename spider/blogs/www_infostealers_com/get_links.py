from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.infostealers.com"
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Find all article elements in the main content area
    articles = soup.select('article.elementor-post')
    
    links = []
    for article in articles:
        # Find the link in the article title
        title_link = article.select_one('h3.elementor-post__title a')
        if title_link and 'href' in title_link.attrs:
            href = title_link['href']
            if not href.startswith('http'):
                href = base_netloc + href
            if "https://www.infostealers.com/article" in href:
                links.append(href)
    
    return links