from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.morphisec.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all blog post links in the main content area
    for article in soup.select('div.afc-single-blog a.afc-single-blog__link'):
        href = article.get('href')
        if href:
            if not href.startswith('http'):
                href = base_netloc + href if not href.startswith('/') else base_netloc + href
            links.append(href)
    
    return links