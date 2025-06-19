from bs4 import BeautifulSoup
import re

def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Extract title
    title_tag = soup.find('h1', class_='blog-page__content-title')
    title = title_tag.get_text(strip=True) if title_tag else None
    
    # Extract publication date
    date_tag = soup.find('div', class_='blog-page__header-date')
    pub_date = None
    if date_tag:
        date_text = date_tag.get_text(strip=True)
        # Extract date in format "Mar 27 2025"
        date_match = re.search(r'([A-Za-z]{3}\s\d{1,2}\s\d{4})', date_text)
        if date_match:
            from datetime import datetime
            pub_date = datetime.strptime(date_match.group(1), '%b %d %Y').strftime('%Y-%m-%d')
    
    # Extract content
    content_body = soup.find('div', class_='blog-page__content-body')
    content = []
    if content_body:
        for p in content_body.find_all('p'):
            content.append(p.get_text(strip=True))
        content_text = '\n'.join(content)
    else:
        content_text = None
    
    article = {
        'title': title,
        'pub_date': pub_date,
        'content': content_text
    }
    
    return article