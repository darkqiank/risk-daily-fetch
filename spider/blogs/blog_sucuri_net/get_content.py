from bs4 import BeautifulSoup
import re
from datetime import datetime

def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Extract title
    title_tag = soup.find('h1', class_='entry-title')
    title = title_tag.get_text(strip=True) if title_tag else None
    
    # Extract publication date
    pub_date = None
    post_meta = soup.find('ul', class_='post-meta')
    if post_meta:
        date_text = post_meta.find('li').get_text(strip=True)
        try:
            pub_date = datetime.strptime(date_text, '%B %d, %Y').strftime('%Y-%m-%d')
        except ValueError:
            pub_date = None
    
    # Extract content
    content = []
    entry_content = soup.find('div', class_='entry-content')
    if entry_content:
        for element in entry_content.find_all(['p', 'h2', 'h3', 'ol', 'ul', 'pre', 'table']):
            if element.name in ['h2', 'h3']:
                content.append('\n' + element.get_text(strip=True) + '\n')
            elif element.name in ['ol', 'ul']:
                for li in element.find_all('li'):
                    content.append(li.get_text(strip=True))
            elif element.name == 'pre':
                content.append(element.get_text())
            elif element.name == 'table':
                rows = []
                for row in element.find_all('tr'):
                    cells = [cell.get_text(strip=True) for cell in row.find_all(['th', 'td'])]
                    rows.append(' | '.join(cells))
                content.append('\n'.join(rows))
            else:
                content.append(element.get_text(strip=True))
    
    # Join content with newlines and clean up
    content_text = '\n'.join([line for line in content if line.strip()])
    
    article = {
        'title': title,
        'pub_date': pub_date,
        'content': content_text
    }
    
    return article