from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://cyble.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all article elements in the main content section
    # articles = soup.select('article.elementor-post')
    articles = soup.find_all('h3', class_='elementor-post__title')
    
    for article in articles:
        # Find the link within each article
        link_tag = article.findNext('a')
        if link_tag and 'href' in link_tag.attrs:
            link = link_tag['href']
            # Check if link needs base_netloc prepended
            if not link.startswith('http'):
                link = base_netloc + link
            if link not in links:
                links.append(link)
    
    return links