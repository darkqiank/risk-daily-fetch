import collections.abc
from urllib.parse import urljoin

from bs4 import BeautifulSoup


def get_links(_content: str) -> list:
    """
    Extracts blog post links from the main content of the Censys blog page.

    Args:
        _content: The HTML content of the page as a string.

    Returns:
        A list of full URLs for the blog posts, in chronological order.
    """
    base_netloc = "https://censys.com"
    soup = BeautifulSoup(_content, "lxml")
    
    # This selector precisely targets the featured article container and the grid article containers,
    # preserving their on-page (chronological) order.
    article_selectors = 'main > article.container, main section.resource-hub-filter div.grid article'
    article_containers = soup.select(article_selectors)

    links = []
    for article in article_containers:
        link_tag = article.find('a', href=True)
        if link_tag:
            href = link_tag.get('href')
            # urljoin correctly handles both relative and absolute URLs.
            full_url = urljoin(base_netloc, href)
            
            # Add to list, ensuring no duplicates.
            if full_url not in links:
                links.append(full_url)
                
    return links