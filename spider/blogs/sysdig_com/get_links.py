from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://sysdig.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all blog card elements
    blog_cards = soup.find_all('a', class_='link-parent', href=True)
    
    for card in blog_cards:
        href = card['href']
        if href and '/blog/' in href:  # Only include blog links
            if not href.startswith('http'):
                href = base_netloc + href
            links.append(href)
    
    return links