from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://1275.ru"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find all article cards in the main content area
    post_cards = soup.find('div', class_='post-cards')
    if post_cards:
        articles = post_cards.find_all('article', class_='post-card')
        for article in articles:
            # Extract link from article title
            title_link = article.find('h2', class_='post-card__title').find('a')
            if title_link and 'href' in title_link.attrs:
                link = title_link['href']
                if not link.startswith('http'):
                    link = base_netloc + link if not link.startswith('/') else base_netloc + link
                links.append(link)
    
    return links