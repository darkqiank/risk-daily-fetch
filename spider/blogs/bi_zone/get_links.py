from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://bi.zone"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all article links in the main content section
    for article in soup.select('.previewBox--1 a[href]'):
        href = article['href']
        if href and not href.startswith('#') and not href.startswith('mailto:'):
            if not href.startswith('http'):
                href = base_netloc + href if not href.startswith('/') else base_netloc + href
            links.append(href)
    
    # Remove duplicates while preserving order
    seen = set()
    unique_links = []
    for link in links:
        if link not in seen and "https://bi.zone/eng/expertise/blog/" in link:
            seen.add(link)
            unique_links.append(link)
    
    return unique_links