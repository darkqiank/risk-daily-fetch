from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.securonix.com"
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Find all blog post items in the main content area
    blog_items = soup.select('div.ep-posts-grid-container div.ep-item.entry-blog')
    
    links = []
    for item in blog_items:
        # Find the link element within each blog item
        link_tag = item.select_one('div.ep-item-title-wrapper h5 a')
        if link_tag and 'href' in link_tag.attrs:
            href = link_tag['href']
            # Check if URL needs base_netloc prepended
            if not href.startswith('http'):
                href = base_netloc + href
            links.append(href)
    
    return links