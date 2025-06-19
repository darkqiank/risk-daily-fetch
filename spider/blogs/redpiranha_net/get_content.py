from bs4 import BeautifulSoup
import re

def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Extract title
    title = soup.find('title').text.strip()
    
    # Extract publication date (from the article heading)
    pub_date = None
    h1 = soup.find('h1', class_='page-title')
    if h1:
        date_match = re.search(r'April (\d{1,2}) - April (\d{1,2}) (\d{4})', h1.text)
        if date_match:
            pub_date = f"{date_match.group(3)}-04-{date_match.group(1).zfill(2)}"  # Using first date
    
    # Extract content
    content = []
    body_div = soup.find('div', class_='field--name-body')
    if body_div:
        # Process all text elements
        for element in body_div.find_all(['p', 'table', 'h2', 'h3', 'ul', 'li']):
            if element.name == 'table':
                # Handle tables by getting all cell text
                rows = []
                for row in element.find_all('tr'):
                    cells = []
                    for cell in row.find_all(['td', 'th']):
                        cell_text = cell.get_text(separator=' ', strip=True)
                        if cell_text:
                            cells.append(cell_text)
                    if cells:
                        rows.append(' | '.join(cells))
                if rows:
                    content.append('\n'.join(rows))
            else:
                text = element.get_text(separator=' ', strip=True)
                if text:
                    content.append(text)
    
    article = {
        'title': title,
        'pub_date': pub_date,
        'content': '\n'.join(content)
    }
    
    return article