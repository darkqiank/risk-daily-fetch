import bs4


def get_links(_content: str) -> list:
    """
    Parses the HTML content to extract a list of main blog post links.

    Args:
        _content: The HTML content as a string.

    Returns:
        A list of absolute URLs for the blog posts.
    """
    base_netloc = "https://www.trellix.com"
    soup = bs4.BeautifulSoup(_content, 'html.parser')
    links = []

    # The main articles are located in the left column (col-md-9)
    # inside a container with id="mresults".
    main_content_container = soup.find('div', id='mresults')

    if main_content_container:
        # Each article is wrapped in a div with class 'topiclisting'.
        article_listings = main_content_container.find_all('div', class_='topiclisting')
        for article in article_listings:
            link_tag = article.find('a')
            if link_tag and 'href' in link_tag.attrs:
                link = link_tag['href']
                if link:
                    # Check if the link is a relative path and construct the full URL.
                    if link.startswith('http'):
                        links.append(link)
                    else:
                        links.append(f"{base_netloc}{link}")
    return links