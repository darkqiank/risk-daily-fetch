import bs4
from urllib.parse import urljoin

def get_links(_content: str) -> list:
    base_netloc = "https://www.halcyon.ai"
    soup = bs4.BeautifulSoup(_content, 'html.parser')

    links = []
    seen_urls = set()

    main_section = soup.find('main')
    if not main_section:
        return links

    for a_tag in main_section.find_all('a', href=True):
        href = a_tag.get('href')

        if href and href.startswith('/blog/') and len(href.strip('/').split('/')) > 1:
            full_url = urljoin(base_netloc, href)
            
            if full_url not in seen_urls:
                links.append(full_url)
                seen_urls.add(full_url)
                
    return links