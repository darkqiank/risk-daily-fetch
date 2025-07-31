from bs4 import BeautifulSoup
from urllib.parse import urljoin

def get_links(_content: str) -> list:
    """
    Extracts blog post links in chronological order from the main content of the page.
    """
    base_netloc = "https://www.attackiq.com"
    soup = BeautifulSoup(_content, "html.parser")
    
    # The main content area that contains the blog posts is within the div with id="inner-wrap".
    # This helps to exclude header, footer, and navigation links.
    main_content = soup.find("div", id="inner-wrap")
    
    if not main_content:
        return []

    # The blog posts are contained within <li> elements that have either
    # 'kb-query-item' or 'gspbgrid_item' as their class.
    # Selecting these containers ensures we only process blog post items.
    post_containers = main_content.select('li.kb-query-item, li.gspbgrid_item')

    extracted_urls = []
    for post in post_containers:
        # Within each container, the first <a> tag typically holds the link to the article.
        link_tag = post.find('a', href=True)
        if link_tag:
            href = link_tag.get('href')
            if href:
                # Ensure the link is an absolute URL.
                full_url = urljoin(base_netloc, href)
                extracted_urls.append(full_url)

    # Remove duplicates while preserving the order of appearance.
    # The dict.fromkeys method is efficient for this.
    links = list(dict.fromkeys(extracted_urls))
    
    return links