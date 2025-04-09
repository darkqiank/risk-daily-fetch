from bs4 import BeautifulSoup
import re

def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Extract title
    title_tag = soup.find('title')
    title = title_tag.text.strip() if title_tag else ''
    
    # Extract publication date (looking in article items)
    pub_date = ''
    article_items = soup.find_all('div', class_='article-item')
    if article_items:
        # Get the first article's date
        date_span = article_items[0].find('span', string=re.compile(r'\d{4}-\d{2}-\d{2}'))
        if date_span:
            pub_date = date_span.text.strip()
    
    # Extract content (combining all article preview texts)
    content_parts = []
    for item in article_items:
        content_div = item.find('div', class_='item-right')
        if content_div:
            text_link = content_div.find('a', class_='text')
            if text_link:
                content_parts.append(text_link.text.strip())
    
    content = '\n'.join(content_parts) if content_parts else ''
    
    article = {
        'title': title,
        'pub_date': pub_date,
        'content': content
    }
    
    return article