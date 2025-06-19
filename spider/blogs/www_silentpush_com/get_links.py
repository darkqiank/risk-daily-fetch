from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.silentpush.com"
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Find all blog post items in the main content grid
    blog_items = soup.select('div.ep-posts-grid-container div.ep-item.ep-posts-grid-item')
    
    links = []
    for item in blog_items:
        # Extract the article link from the h5 title anchor
        title_anchor = item.select_one('h5.ep-item-title a')
        if title_anchor:
            link = title_anchor['href']
            if not link.startswith('http'):
                link = base_netloc + link
            links.append(link)
    
    return links