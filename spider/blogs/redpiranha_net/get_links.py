from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://redpiranha.net"
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Find all article links in the main content area
    links = []
    for article in soup.select('.views-view-grid .news-events-container'):
        link = article.find('a', href=True)
        if link:
            href = link['href']
            if not href.startswith('http'):
                href = base_netloc + href if not href.startswith('/') else base_netloc + href
            links.append(href)
    
    return links