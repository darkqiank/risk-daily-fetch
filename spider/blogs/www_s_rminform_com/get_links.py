from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.s-rminform.com"
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Find all article links in the main content section
    articles = soup.select('article a[href]')
    
    links = []
    for article in articles:
        href = article['href']
        if href.startswith('/'):
            href = base_netloc + href
        elif not href.startswith('http'):
            continue  # Skip non-http links
            
        # Skip pagination links and other non-article links
        if 'latest-thinking' in href and 'page/' not in href:
            links.append(href)
    
    # Remove duplicates while preserving order
    seen = set()
    links = [x for x in links if not (x in seen or seen.add(x))]
    
    return links