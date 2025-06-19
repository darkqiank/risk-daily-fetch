from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.huntress.com"
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Find all blog article links in the main content area
    links = []
    for article in soup.select('div.filter-box'):
        link = article.find('a', class_='blog-index-card-link')
        if link and link.has_attr('href'):
            href = link['href']
            if not href.startswith('http'):
                href = base_netloc + href
            links.append(href)
    
    return links