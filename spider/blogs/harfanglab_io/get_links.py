from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://harfanglab.io"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all article cards in the main content grid
    article_cards = soup.select('section.grid__container a.grid__item.card--inside')
    
    for card in article_cards:
        href = card.get('href')
        if href:
            if not href.startswith('http'):
                href = base_netloc + href if not href.startswith('/') else base_netloc + href
            links.append(href)
    
    return links