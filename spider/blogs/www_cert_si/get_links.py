from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.cert.si"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all article cards in the main content area
    article_cards = soup.select('main .card .card-body h2.card-title a')
    
    for link in article_cards:
        href = link.get('href')
        if href:
            if not href.startswith('http'):
                href = base_netloc + href if not href.startswith('/') else base_netloc + href
            links.append(href)
    
    return links