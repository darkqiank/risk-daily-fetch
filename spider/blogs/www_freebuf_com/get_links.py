from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.freebuf.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all article items in the main content area
    article_items = soup.select('div.article-list div.article-item')
    
    for item in article_items:
        # Find the title link within each article item
        title_link = item.select_one('div.title-left a[href^="/"]')
        if title_link:
            href = title_link['href']
            if not href.startswith('http'):
                href = base_netloc + href
            links.append(href)
    
    return links