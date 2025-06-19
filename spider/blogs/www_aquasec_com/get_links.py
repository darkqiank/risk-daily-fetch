from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.aquasec.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all blog post links in the main content area
    blog_items = soup.select('div.blog_item_wrap a.blog_link_card[href]')
    for item in blog_items:
        href = item['href']
        if not href.startswith('http'):
            href = base_netloc + href if not href.startswith('/') else base_netloc + href
        links.append(href)
    
    # Also check popular posts section
    popular_items = soup.select('div.popular_posts a.item[href]')
    for item in popular_items:
        href = item['href']
        if not href.startswith('http'):
            href = base_netloc + href if not href.startswith('/') else base_netloc + href
        if href not in links:
            links.append(href)
    
    return links