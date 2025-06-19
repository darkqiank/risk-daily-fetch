from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.intezer.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all blog post cards in the archive section
    blog_cards = soup.select('section#archive a[href][id="resource-card"]')
    
    for card in blog_cards:
        href = card.get('href')
        if href:
            if not href.startswith('http'):
                if href.startswith('/'):
                    href = base_netloc + href
                else:
                    href = base_netloc + '/' + href
            links.append(href)
    
    return links