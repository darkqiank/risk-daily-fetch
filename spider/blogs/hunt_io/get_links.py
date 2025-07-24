import bs4
from urllib.parse import urljoin

base_netloc = "https://hunt.io"

def get_links(_content: str) -> list:
    """
    Parses HTML content to extract a list of main blog post links.

    Args:
        _content: The HTML content as a string.

    Returns:
        A list of absolute URLs for the blog posts.
    """
    if not _content:
        return []

    soup = bs4.BeautifulSoup(_content, 'html.parser')

    # The class 'framer-h4chx5' is a reliable parent container for the article lists.
    # This helps to scope the search to the main content area, avoiding sidebars and footers.
    content_area = soup.find('div', class_='framer-h4chx5')
    
    if not content_area:
        return []
        
    links = []
    seen_links = set()
    
    # Find all anchor tags within the scoped content area that have an href attribute.
    for a_tag in content_area.find_all('a', href=True):
        href = a_tag['href']
        
        # Filter for links that point to blog posts. Based on the structure, 
        # they start with './blog/' and are not archive links.
        if href and href.startswith('./blog/') and '/blog-archive/' not in href:
            # urljoin handles joining the base URL with relative paths.
            # It also correctly handles cases where a link might already be absolute.
            full_link = urljoin(base_netloc, href)
            
            # Add the link only if it hasn't been seen before to ensure uniqueness
            # while preserving the order of appearance.
            if full_link not in seen_links:
                links.append(full_link)
                seen_links.add(full_link)
            
    return links[:20]