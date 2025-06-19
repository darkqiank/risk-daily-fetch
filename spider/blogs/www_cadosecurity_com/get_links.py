from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.cadosecurity.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all blog post cards in the main content area
    blog_posts = soup.select('div.posts a.blog-post-card')
    
    for post in blog_posts:
        href = post.get('href')
        if href:
            if not href.startswith('http'):
                if href.startswith('/'):
                    href = base_netloc + href
                else:
                    href = base_netloc + '/' + href
            links.append(href)
    
    return links