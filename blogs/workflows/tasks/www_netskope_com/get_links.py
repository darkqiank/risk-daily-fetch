from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.netskope.com"
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Find all article links in the blog tiles section
    blog_tiles = soup.find('div', class_='blogs__tiles')
    if not blog_tiles:
        return []
    
    links = []
    for card in blog_tiles.find_all('div', class_='card'):
        link = card.find('a', class_='card__content')
        if link and 'href' in link.attrs:
            href = link['href']
            if not href.startswith('http'):
                href = base_netloc + href
            links.append(href)
    
    return links