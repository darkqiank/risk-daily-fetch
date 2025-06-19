from bs4 import BeautifulSoup
import re
from datetime import datetime

def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Extract title
    title_tag = soup.find('h1', class_='elementor-heading-title')
    title = title_tag.get_text(strip=True) if title_tag else None
    
    # Extract publication date
    pub_date = None
    date_tag = soup.find('time')
    if date_tag:
        date_str = date_tag.get_text(strip=True)
        try:
            pub_date = datetime.strptime(date_str, '%B %d, %Y').strftime('%Y-%m-%d')
        except ValueError:
            pass
    
    # Extract content
    content_div = soup.find('div', class_='elementor-widget-theme-post-content')
    content = []
    if content_div:
        for element in content_div.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table']):
            if element.name == 'table':
                # Handle tables by joining cells with newlines
                table_text = []
                for row in element.find_all('tr'):
                    row_text = []
                    for cell in row.find_all(['th', 'td']):
                        row_text.append(cell.get_text(strip=True))
                    table_text.append(' | '.join(row_text))
                content.append('\n'.join(table_text))
            else:
                content.append(element.get_text(strip=True))
    
    article = {
        'title': title,
        'pub_date': pub_date,
        'content': '\n'.join(content) if content else None
    }
    
    return article