from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.reversinglabs.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all article links in the main blog listing section
    blog_items = soup.select('div.blog__listing--default article.blog__item a[href]')
    for item in blog_items:
        href = item['href']
        if href and '/blog/' in href:  # Ensure it's a blog post link
            if not href.startswith('http'):
                href = base_netloc + href if not href.startswith('/') else base_netloc + href
            if href not in links:  # Avoid duplicates
                links.append(href)
    
    return links