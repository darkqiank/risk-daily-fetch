from bs4 import BeautifulSoup
import re

def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Extract title
    title_tag = soup.find('title')
    title = title_tag.text.strip() if title_tag else ''
    
    # Extract publication date
    pub_date = ''
    date_span = soup.find('span', class_='alert_date')
    if date_span:
        date_text = date_span.text.strip()
        # Convert date format from YYYY/MM/DD to YYYY-MM-DD
        pub_date = date_text.replace('/', '-')
    
    # Extract content
    content = ''
    pre_tag = soup.find('pre', class_='alert_detail')
    if pre_tag:
        # Get all text elements including tables
        content_parts = []
        for element in pre_tag.contents:
            if element.name == 'table':
                # Process table rows
                rows = []
                for row in element.find_all('tr'):
                    cells = []
                    for cell in row.find_all(['th', 'td']):
                        cell_text = cell.get_text(separator=' ', strip=True)
                        cells.append(cell_text)
                    rows.append(' | '.join(cells))
                content_parts.append('\n'.join(rows))
            else:
                text = element.get_text(separator='\n', strip=True)
                content_parts.append(text)
        content = '\n'.join(content_parts)
    
    article = {
        'title': title,
        'pub_date': pub_date,
        'content': content
    }
    
    return article