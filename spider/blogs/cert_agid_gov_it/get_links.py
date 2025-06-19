from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://cert-agid.gov.it"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # Find the main news section
    news_section = soup.find('div', class_='Grid-cell u-sizeFull u-md-size7of12 u-lg-size7of12')
    if news_section:
        # Find all article links in the news section
        articles = news_section.find_all('article', class_='Grid-cell u-sizeFull u-print-whole')
        for article in articles:
            link_tag = article.find('a', class_='u-text-h4 u-textClean u-color-50 u-text-r-s u-color-print')
            if link_tag and 'href' in link_tag.attrs:
                link = link_tag['href']
                if not link.startswith('http'):
                    link = base_netloc + link if link.startswith('/') else base_netloc + '/' + link
                links.append(link)
    
    return links