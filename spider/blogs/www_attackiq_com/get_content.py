from bs4 import BeautifulSoup
import re
from datetime import datetime

def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    article = {
        'title': '',
        'pub_date': '',
        'content': ''
    }
    
    # Extract title
    title_tag = soup.find('h1', class_='post-title')
    if title_tag:
        article['title'] = title_tag.get_text(strip=True)
    
    # Extract publication date
    date_tag = soup.find('h5', class_='post-date')
    if date_tag:
        date_text = date_tag.get_text(strip=True)
        # Extract date using regex
        date_match = re.search(r'(?:Published\s+)?(\w+\s+\d{1,2},\s+\d{4})', date_text)
        if date_match:
            try:
                pub_date = datetime.strptime(date_match.group(1), '%B %d, %Y')
                article['pub_date'] = pub_date.strftime('%Y-%m-%d')
            except ValueError:
                pass
    
    # Extract content
    content_section = soup.find('section', class_='post-content')
    if content_section:
        content_parts = []
        for element in content_section.find_all(['p', 'h2', 'h3', 'h4', 'ul', 'table']):
            if element.name in ['h2', 'h3', 'h4']:
                content_parts.append(element.get_text(strip=True))
            elif element.name == 'ul':
                for li in element.find_all('li'):
                    content_parts.append(li.get_text(strip=True))
            elif element.name == 'table':
                # Handle tables - just get text for now
                content_parts.append(element.get_text(' ', strip=True))
            else:
                content_parts.append(element.get_text(strip=True))
        article['content'] = '\n'.join(content_parts)
    
    return article