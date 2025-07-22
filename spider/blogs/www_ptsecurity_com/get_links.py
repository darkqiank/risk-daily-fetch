from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://global.ptsecurity.com/en/research/pt-esc-threat-intelligence/"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all article elements in the main content section
    articles = soup.select('article.ArticleList_list-item__gvqH4')
    
    for article in articles:
        # Find the anchor tag with absolute positioning that contains the article link
        anchor = article.select_one('a.absolute.bottom-0.left-0.right-0.top-0')
        if anchor and 'href' in anchor.attrs:
            href = anchor['href']
            if not href.startswith('http'):
                href = base_netloc + href
            links.append(href)
    
    return links