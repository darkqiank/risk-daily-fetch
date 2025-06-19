from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://labs.k7computing.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all article elements in the main content area
    articles = soup.select('div.post-area article.regular')
    
    for article in articles:
        # Extract the link from the article's title anchor tag
        title_link = article.select_one('h3.title a')
        if title_link and title_link.has_attr('href'):
            href = title_link['href']
            if not href.startswith('http'):
                href = base_netloc + href if not href.startswith('/') else base_netloc + href
            links.append(href)
    
    return links