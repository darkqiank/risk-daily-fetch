from bs4 import BeautifulSoup
import re

def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Extract title
    title_tag = soup.find('title')
    title = title_tag.text.strip() if title_tag else ''
    
    # Extract publication date
    pub_date = ''
    date_element = soup.find('div', class_='post_date')
    if date_element:
        pub_date = date_element.text.strip()
        # Try to parse date into YYYY-MM-DD format
        date_match = re.search(r'(\w+\s\d{1,2},\s\d{4}|\w+\s\d{4})', pub_date)
        if date_match:
            from datetime import datetime
            try:
                pub_date = datetime.strptime(date_match.group(), '%B %d, %Y').strftime('%Y-%m-%d')
            except:
                try:
                    pub_date = datetime.strptime(date_match.group(), '%B %Y').strftime('%Y-%m-%d')
                except:
                    pub_date = date_match.group()
    
    # Extract content
    content_parts = []
    content_div = soup.find('div', class_='content')
    
    if content_div:
        # Process all text elements
        for element in content_div.find_all(['p', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'table']):
            if element.name == 'table':
                # Handle tables by extracting all text with line breaks
                table_text = '\n'.join([row.get_text(' ', strip=True) for row in element.find_all('tr')])
                content_parts.append(table_text)
            else:
                # For other elements, just get the text
                text = element.get_text(' ', strip=True)
                if text:
                    content_parts.append(text)
    
    content = '\n'.join(content_parts)
    
    article = {
        'title': title,
        'pub_date': pub_date,
        'content': content
    }
    
    return article