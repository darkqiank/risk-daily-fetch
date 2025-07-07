from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.genians.co.kr"
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Find all blog post links in the listing section
    links = []
    blog_listings = soup.find_all('div', class_='blog-index-post-wrpr')
    
    for listing in blog_listings:
        link_tag = listing.find('a', href=True)
        if link_tag:
            href = link_tag['href']
            if not href.startswith('http'):
                href = base_netloc + href
            links.append(href)
    
    return links