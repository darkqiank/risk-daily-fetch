from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://blog.sucuri.net"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find main content area
    main_content = soup.find('main', {'id': 'main'})
    if not main_content:
        return links
    
    # Extract article links from the main content
    for article in main_content.find_all('article'):
        header = article.find('header', class_='entry-header')
        if header:
            a_tag = header.find('a', href=True)
            if a_tag:
                link = a_tag['href']
                if not link.startswith('http'):
                    link = base_netloc + link if not link.startswith('/') else base_netloc + link
                links.append(link)
    
    return links