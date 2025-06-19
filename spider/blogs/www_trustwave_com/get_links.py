from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.trustwave.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all blog post links in the main content area
    for post in soup.select('.post-single-content h2 a'):
        href = post.get('href')
        if href:
            if not href.startswith('http'):
                href = base_netloc + href
            links.append(href)
    
    # Also check featured posts which have a different structure
    for featured in soup.select('.featured-post-wrapper h2 a'):
        href = featured.get('href')
        if href:
            if not href.startswith('http'):
                href = base_netloc + href
            links.append(href)
    
    return links