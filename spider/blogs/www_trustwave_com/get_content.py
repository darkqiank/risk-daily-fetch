from bs4 import BeautifulSoup
import re

def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Extract title
    title = soup.find('title').get_text(strip=True) if soup.find('title') else None
    
    # Extract publication date
    pub_date = None
    date_element = soup.find('time')
    if date_element and 'datetime' in date_element.attrs:
        datetime_str = date_element['datetime']
        # Extract just the date part (YYYY-MM-DD)
        pub_date = datetime_str.split()[0] if datetime_str else None
    
    # Extract content
    content_div = soup.find('span', id='hs_cos_wrapper_post_body')
    content = []
    if content_div:
        # Process all text elements, including tables
        for element in content_div.find_all(['p', 'h3', 'table']):
            if element.name == 'table':
                # Handle tables - extract all text with line breaks
                table_text = []
                for row in element.find_all('tr'):
                    row_text = []
                    for cell in row.find_all(['td', 'th']):
                        cell_text = cell.get_text(' ', strip=True)
                        row_text.append(cell_text)
                    table_text.append(' | '.join(row_text))
                content.append('\n'.join(table_text))
            else:
                # Handle regular text elements
                text = element.get_text(' ', strip=True)
                if text:
                    content.append(text)
    
    # Join all content with newlines to separate paragraphs and tables
    full_content = '\n'.join(content) if content else None
    
    article = {
        'title': title,
        'pub_date': pub_date,
        'content': full_content
    }
    
    return article