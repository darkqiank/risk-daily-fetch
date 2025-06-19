from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.cyberark.com"
    soup = BeautifulSoup(_content, 'html.parser')
    
    links = []
    
    # Find all blog post tiles in the main content area
    blog_tiles = soup.select('li.tile.single.blogpost.stream-6824673.with-img')
    
    for tile in blog_tiles:
        # Find the 'Read Blog' link within each tile
        link_tag = tile.find('a', class_='item-link view')
        if link_tag and 'href' in link_tag.attrs:
            href = link_tag['href']
            # Ensure the link is absolute
            if not href.startswith('http'):
                href = base_netloc + href if not href.startswith('/') else base_netloc + href
            links.append(href)
    
    return links