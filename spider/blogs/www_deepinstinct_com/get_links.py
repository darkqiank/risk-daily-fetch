from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.deepinstinct.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all blog cards in the main blog list section
    blog_cards = soup.select('div.blogs-list__list div.blogs-list__item div.blog-card')
    
    for card in blog_cards:
        # Extract the article link from the title anchor tag
        title_link = card.select_one('h3.blog-card__title a')
        if title_link and 'href' in title_link.attrs:
            link = title_link['href']
            if not link.startswith('http'):
                link = base_netloc + link
            links.append(link)
    
    return links