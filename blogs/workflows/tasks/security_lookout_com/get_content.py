from bs4 import BeautifulSoup
import re
from datetime import datetime

def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Extract title
    title_tag = soup.find('title')
    title = title_tag.text.strip() if title_tag else ''
    
    # Extract publish date from comment
    pub_date = ''
    comment_pattern = re.compile(r'Last Published:\s*(.*?)\s*GMT')
    comment = soup.find(string=comment_pattern)
    if comment:
        match = comment_pattern.search(comment)
        if match:
            date_str = match.group(1)
            try:
                pub_date = datetime.strptime(date_str, '%a %b %d %Y %H:%M:%S').strftime('%Y-%m-%d')
            except ValueError:
                pass
    
    # Extract content
    content_paragraphs = []
    content_sections = soup.find_all(['p', 'h2', 'h3'])
    for element in content_sections:
        text = element.get_text(separator=' ', strip=True)
        if text and not any(exclude in text for exclude in ['Read full technical report', 'Interactive Demo', '© 2025 Lookout']):
            content_paragraphs.append(text)
    
    content = '\n'.join(content_paragraphs)
    
    article = {
        'title': title,
        'pub_date': pub_date,
        'content': content
    }
    
    return article