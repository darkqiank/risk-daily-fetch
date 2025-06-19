from bs4 import BeautifulSoup
import re

def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Extract title
    title = soup.find('title').get_text(strip=True) if soup.find('title') else ''
    
    # Extract publication date
    pub_date = ''
    date_element = soup.find(class_='u-text-l u-color-50 u-margin-top-xs')
    if date_element:
        date_text = date_element.get_text(strip=True)
        # Extract date in YYYY-MM-DD format
        date_match = re.search(r'(\d{2})/(\d{2})/(\d{4})', date_text)
        if date_match:
            day, month, year = date_match.groups()
            pub_date = f"{year}-{month}-{day}"
    
    # Extract content
    content_parts = []
    content_div = soup.find('div', class_='News-prose')
    if content_div:
        # Process all text elements
        for element in content_div.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'figcaption']):
            text = element.get_text('\n', strip=True)
            if text:
                content_parts.append(text)
        
        # Process tables if any
        for table in content_div.find_all('table'):
            rows = []
            for row in table.find_all('tr'):
                cells = [cell.get_text(strip=True) for cell in row.find_all(['td', 'th'])]
                rows.append('\t'.join(cells))
            if rows:
                content_parts.append('\n'.join(rows))
    
    content = '\n'.join(content_parts) if content_parts else ''
    
    return {
        'title': title,
        'pub_date': pub_date,
        'content': content
    }