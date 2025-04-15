from bs4 import BeautifulSoup
import re

def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Extract title
    title = soup.find('title').get_text(strip=True) if soup.find('title') else ''
    
    # Extract publication date (YYYY-MM-DD format)
    pub_date = ''
    date_element = soup.find(class_='b15-blog-meta__date')
    if date_element:
        date_text = date_element.get_text(strip=True)
        # Extract date in format YYYY年MM月DD日 and convert to YYYY-MM-DD
        date_match = re.search(r'(\d{4})年(\d{1,2})月(\d{1,2})日', date_text)
        if date_match:
            year, month, day = date_match.groups()
            pub_date = f"{year}-{month.zfill(2)}-{day.zfill(2)}"
    
    # Extract content
    content_parts = []
    content_div = soup.find('div', class_='b3-blog-list__column-right')
    if content_div:
        # Process all text elements
        for element in content_div.find_all(['p', 'h2', 'h3', 'h4', 'li', 'table']):
            if element.name == 'table':
                # Handle tables by joining all cell texts with newlines
                table_text = []
                for row in element.find_all('tr'):
                    row_text = []
                    for cell in row.find_all(['td', 'th']):
                        cell_text = cell.get_text(' ', strip=True)
                        if cell_text:
                            row_text.append(cell_text)
                    if row_text:
                        table_text.append(' | '.join(row_text))
                if table_text:
                    content_parts.append('\n'.join(table_text))
            else:
                element_text = element.get_text(' ', strip=True)
                if element_text:
                    content_parts.append(element_text)
    
    content = '\n'.join(content_parts)
    
    article = {
        'title': title,
        'pub_date': pub_date,
        'content': content
    }
    
    return article