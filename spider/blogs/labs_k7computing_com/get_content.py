from bs4 import BeautifulSoup
import re

def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Extract title
    title = soup.find('title').get_text(strip=True) if soup.find('title') else ''
    
    # Extract publication date (YYYY-MM-DD format)
    pub_date = ''
    time_tag = soup.find('time', {'class': 'entry-date published'})
    if time_tag and 'datetime' in time_tag.attrs:
        datetime_str = time_tag['datetime']
        # Extract date part from datetime string (YYYY-MM-DD)
        match = re.search(r'(\d{4}-\d{2}-\d{2})', datetime_str)
        if match:
            pub_date = match.group(1)
    
    # Extract content
    content_parts = []
    content_div = soup.find('div', class_='wpb_wrapper')
    if content_div:
        # Get all text elements, including paragraphs, headings, lists, etc.
        for element in content_div.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'table']):
            text = element.get_text('\n', strip=True)  # Use newline for line breaks within elements
            if text:
                content_parts.append(text)
    
    content = '\n'.join(content_parts)
    
    article = {
        'title': title,
        'pub_date': pub_date,
        'content': content
    }
    
    return article