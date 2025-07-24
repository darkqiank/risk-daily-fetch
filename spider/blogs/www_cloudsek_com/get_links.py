import bs4

def get_links(_content: str) -> list:
    """
    Parses HTML content to extract a list of blog post links from the main content area.

    Args:
        _content: A string containing the HTML content of the page.

    Returns:
        A list of absolute URLs for the blog posts.
    """
    base_netloc = "https://www.cloudsek.com"
    links = []
    
    if not _content:
        return links

    soup = bs4.BeautifulSoup(_content, 'html.parser')

    # Target the main container for the blog post list.
    # The div with class 'blog-collection-list' contains the primary article list.
    list_container = soup.find('div', class_='blog-collection-list')

    if not list_container:
        return links

    # Each article link is within an <a> tag with the class 'blog-card'
    article_links = list_container.find_all('a', class_='blog-card')

    for link_tag in article_links:
        href = link_tag.get('href')
        if href:
            # Check if the link is relative or absolute
            if href.startswith('http'):
                full_link = href
            else:
                full_link = f"{base_netloc}{href}"
            
            if full_link not in links:
                links.append(full_link)

    return links