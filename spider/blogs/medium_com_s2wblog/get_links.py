from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://medium.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all article containers in the main content area
    article_containers = soup.find_all('div', {'class': 'js-trackPostPresentation'})
    
    for container in article_containers:
        # Find the article link within each container
        link_tag = container.find('a', {'data-action': 'open-post'})
        if link_tag and 'href' in link_tag.attrs:
            link = link_tag['href']
            # Process the link
            if not link.startswith('http'):
                link = base_netloc + link if link.startswith('/') else base_netloc + '/' + link
            links.append(link)
    
    return links