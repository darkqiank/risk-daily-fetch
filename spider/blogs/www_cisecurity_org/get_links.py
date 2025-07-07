from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.cisecurity.org"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all blog post links in the main content area
    for article in soup.select('div.c-list-results div.c-list-result'):
        link = article.find('a', class_='c-list-link')
        if link and link.get('href'):
            url = link['href']
            if not url.startswith('http'):
                url = base_netloc + url
            links.append(url)
    
    return links