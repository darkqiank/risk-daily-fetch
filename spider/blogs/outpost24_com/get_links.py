from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://outpost24.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all blog post cards in the main listing container
    listing_container = soup.find('div', class_='listing-container-left')
    if listing_container:
        post_cards = listing_container.find_all('div', class_='listing-post-card')
        for card in post_cards:
            link_tag = card.find('a', href=True)
            if link_tag:
                href = link_tag['href']
                if not href.startswith('http'):
                    href = base_netloc + href
                links.append(href)
    
    return links