from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.team-cymru.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find the main blog posts container
    blog_list = soup.find('div', class_='blog-post-list')
    if blog_list:
        for item in blog_list.find_all('a', class_='blog-post-link-block'):
            href = item.get('href')
            if href:
                if not href.startswith('http'):
                    href = base_netloc + href
                links.append(href)
    
    return links