from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.sygnia.co"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all article cards in the main content section
    article_cards = soup.select('div.articles_list div.article-card')
    
    for card in article_cards:
        # Extract the link from the article card's anchor tag
        link_tag = card.select_one('a.article-card__image')
        if link_tag and 'href' in link_tag.attrs:
            href = link_tag['href']
            # Process the URL
            if not href.startswith('http'):
                if href.startswith('/'):
                    href = base_netloc + href
                else:
                    href = base_netloc + '/' + href
            links.append(href)
    
    return links