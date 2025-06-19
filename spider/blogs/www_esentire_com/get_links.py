from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.esentire.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Extract blog links from the main blog section
    blog_section = soup.find('section', class_='BlogLibraryCards')
    if blog_section:
        for link in blog_section.find_all('a', href=True):
            href = link['href']
            if href.startswith('/blog/') or href.startswith('https://www.esentire.com/blog/'):
                if not href.startswith('http'):
                    href = base_netloc + href
                links.append(href)
    
    # Extract blog links from the TRU Latest section
    tru_section = soup.find('section', class_='TRULatest')
    if tru_section:
        for link in tru_section.find_all('a', href=True):
            href = link['href']
            if href.startswith('/blog/') or href.startswith('https://www.esentire.com/blog/'):
                if not href.startswith('http'):
                    href = base_netloc + href
                links.append(href)
    
    # Remove duplicates while preserving order
    seen = set()
    unique_links = []
    for link in links:
        if link not in seen:
            seen.add(link)
            unique_links.append(link)
    
    return unique_links