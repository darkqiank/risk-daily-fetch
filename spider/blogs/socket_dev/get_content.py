from bs4 import BeautifulSoup
import re

def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Extract title
    title_tag = soup.find('title')
    title = title_tag.text.strip() if title_tag else ''
    
    # Extract publication date
    pub_date_tag = soup.find('p', class_='css-0')
    pub_date = ''
    if pub_date_tag:
        date_text = pub_date_tag.text.strip()
        # Extract date in YYYY-MM-DD format using regex
        date_match = re.search(r'(\w+ \d{1,2}, \d{4})', date_text)
        if date_match:
            from datetime import datetime
            try:
                pub_date = datetime.strptime(date_match.group(1), '%B %d, %Y').strftime('%Y-%m-%d')
            except:
                pass
    
    # Extract content
    content_div = soup.find('div', class_='prose')
    content = []
    if content_div:
        for element in content_div.find_all(['p', 'h2', 'h3', 'ul', 'li']):
            text = element.get_text().strip()
            if text:
                content.append(text)
    content_text = '\n'.join(content)
    
    article = {
        'title': title,
        'pub_date': pub_date,
        'content': content_text
    }
    
    return article