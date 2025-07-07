from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://cybersrcc.com"
    soup = BeautifulSoup(_content, 'html.parser')
    
    links = []
    
    # Find all article containers in the main content area
    article_containers = soup.select('div.isotope-system div.tmb.tmb-iso-w2.tmb-iso-h4')
    
    for article in article_containers:
        # Extract the article link
        link_tag = article.select_one('a.pushed[href]')
        if link_tag:
            link = link_tag['href']
            if not link.startswith('http'):
                link = base_netloc + link if not link.startswith('/') else base_netloc + link
            links.append(link)
    
    return links