from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.lookout.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all article links in the main content sections
    for link in soup.select('main a[href^="/threat-intelligence/article"], main a[href^="/threat-intelligence/report"]'):
        href = link.get('href')
        if href:
            if not href.startswith('http'):
                href = base_netloc + href
            links.append(href)
    
    # Remove duplicates while preserving order
    seen = set()
    unique_links = []
    for link in links:
        if link not in seen:
            seen.add(link)
            unique_links.append(link)
    
    return unique_links