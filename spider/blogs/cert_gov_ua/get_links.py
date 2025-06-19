from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://cert.gov.ua"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    for item in soup.find_all('items'):
        if item.find('id'):
            article_id = item.find('id').text
            link = f"/api/articles/byId?id={article_id}&lang=uk"
            if not link.startswith('http'):
                link = base_netloc + link
            links.append(link)
    
    return links