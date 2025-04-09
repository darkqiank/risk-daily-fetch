from bs4 import BeautifulSoup
import re

def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Extract title
    title_tag = soup.find('title')
    title = title_tag.text.strip() if title_tag else ''
    
    # Extract publication date
    pub_date = ''
    date_tag = soup.find('time')
    if date_tag and 'datetime' in date_tag.attrs:
        datetime_str = date_tag['datetime']
        # Extract YYYY-MM-DD from datetime string
        match = re.search(r'(\d{4}-\d{2}-\d{2})', datetime_str)
        if match:
            pub_date = match.group(1)
    
    # Extract content
    content_body = soup.find('div', class_='node-full__body blog-content__body')
    content = []
    if content_body:
        for element in content_body.find_all(['p', 'h2', 'h3', 'h4', 'li', 'pre', 'table']):
            text = element.get_text(separator=' ', strip=True)
            if text:
                content.append(text)
    
    article = {
        'title': title,
        'pub_date': pub_date,
        'content': '\n'.join(content) if content else ''
    }
    
    return article