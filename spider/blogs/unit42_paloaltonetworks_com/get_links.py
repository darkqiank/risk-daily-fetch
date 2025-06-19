from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://unit42.paloaltonetworks.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all article links in the main content sections
    for section in soup.find_all('section', class_=['section--threat-research', 'section--top-cyberthreats']):
        for link in section.find_all('a', href=True):
            href = link['href']
            if href.startswith('/') and not href.startswith('//'):
                href = base_netloc + href
            if href.startswith('http') and 'unit42.paloaltonetworks.com' in href:
                if href not in links and not any(x in href for x in ['/category/', '/tag/', '/tools/', '/about-', '/contact-']):
                    links.append(href)
    
    # Also check the featured posts in the overview banner
    for article in soup.find_all('article'):
        for link in article.find_all('a', href=True):
            href = link['href']
            if href.startswith('/') and not href.startswith('//'):
                href = base_netloc + href
            if href.startswith('http') and 'unit42.paloaltonetworks.com' in href:
                if href not in links and not any(x in href for x in ['/category/', '/tag/', '/tools/', '/about-', '/contact-']):
                    links.append(href)
    
    return links