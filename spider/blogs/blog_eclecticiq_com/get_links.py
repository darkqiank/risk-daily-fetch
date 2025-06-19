from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://blog.eclecticiq.com"
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Find all article links in the main content grid
    article_links = []
    for article in soup.select('nav.grid.grid-cols-1.sm\\:grid-cols-2.xl\\:grid-cols-4 a[href]'):
        href = article['href']
        if href.startswith('http'):
            article_links.append(href)
        else:
            article_links.append(base_netloc + href)
    
    # Remove duplicates while preserving order
    seen = set()
    links = []
    for link in article_links:
        if link not in seen:
            seen.add(link)
            links.append(link)
    
    return links[0:10]