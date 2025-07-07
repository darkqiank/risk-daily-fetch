from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://medium.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all article elements with data-testid="post-preview"
    articles = soup.find_all('article', {'data-testid': 'post-preview'})
    
    for article in articles:
        # Find the first <a> tag with href attribute in each article
        link_tag = article.find('a', href=True)
        if link_tag:
            href = link_tag['href']
            if not href.startswith('http'):
                href = base_netloc + href
            links.append(href)
    
    return links