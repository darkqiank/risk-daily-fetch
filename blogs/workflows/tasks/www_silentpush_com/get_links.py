from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.silentpush.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all blog post items in the main content grid
    blog_items = soup.select('div.ep-posts-grid-item.ep-post-grid-item')
    
    for item in blog_items:
        # Extract the link from the h5 title element
        title_link = item.select_one('h5.ep-item-title a')
        if title_link and 'href' in title_link.attrs:
            href = title_link['href']
            if not href.startswith('http'):
                href = base_netloc + href
            links.append(href)
    
    return links