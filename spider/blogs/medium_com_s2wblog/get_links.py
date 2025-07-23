import re
from bs4 import BeautifulSoup


def get_links(_content: str):
    """
    Parses the HTML content of a Medium blog page to extract article links.

    Args:
        _content: The HTML content as a string.

    Returns:
        A list of unique, absolute URLs for the articles found in the main content area.
    """
    base_netloc = "https://medium.com"
    soup = BeautifulSoup(_content, 'html.parser')
    unique_links = set()

    # Articles are within <article> tags with data-testid="post-preview"
    articles = soup.find_all('article', attrs={'data-testid': 'post-preview'})

    for article in articles:
        # The main link is on an <a> tag that is an ancestor of the <h2> title tag.
        # This is a reliable way to find the primary link for the article.
        h2_tag = article.find('h2')
        if h2_tag:
            link_tag = h2_tag.find_parent('a')
            if link_tag and link_tag.has_attr('href'):
                href = link_tag['href']
                # Remove query parameters like '?source=...' to get a clean URL
                clean_href = href.split('?')[0]
                unique_links.add(clean_href)

    links = []
    for link in unique_links:
        if link.startswith("http"):
            links.append(link)
        else:
            # Handle relative links by prepending the base netloc
            full_link = f"{base_netloc}{link}"
            links.append(full_link)

    return links