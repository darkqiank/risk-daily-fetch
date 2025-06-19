from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.bridewell.com/insights/blogs"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all blog article links in the main content area
    for article in soup.select('div.insights-block-wrp a.insights-block[href]'):
        href = article['href']
        if href and '/insights/blogs/detail/' in href:
            if not href.startswith('http'):
                href = base_netloc + href if not href.startswith('/') else base_netloc + href
            links.append(href)
    
    return links