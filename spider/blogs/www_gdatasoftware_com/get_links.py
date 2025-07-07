from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.gdatasoftware.com"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find the main content section containing blog articles
    main_content = soup.find('main', id='main-content')
    if main_content:
        # Find all article cards in the main content
        article_cards = main_content.find_all('div', class_='nm-card-blog')
        for card in article_cards:
            # Find the article title link
            title_link = card.find('h3', class_='nm-card-blog-title').find('a')
            if title_link and title_link.has_attr('href'):
                href = title_link['href']
                if not href.startswith('http'):
                    href = base_netloc + href
                links.append(href)
    
    return links