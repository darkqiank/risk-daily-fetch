from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.proofpoint.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find blog mosaic items which contain the main article links
    blog_items = soup.find_all('div', class_='blog-mosaic__item')
    for item in blog_items:
        link = item.find('a', class_='blog-mosaic__link')
        if link and 'href' in link.attrs:
            href = link['href']
            if not href.startswith('http'):
                href = base_netloc + href
            links.append(href)
    
    return links