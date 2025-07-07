from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://dti.domaintools.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all article links in the main content grid
    grid_items = soup.select('div.ep-posts-grid-container div.ep-item a.noHover.ep-link-wrapper')
    
    for item in grid_items:
        href = item.get('href')
        if href:
            if not href.startswith('http'):
                href = base_netloc + href if not href.startswith('/') else base_netloc + href
            links.append(href)
    
    return links