from bs4 import BeautifulSoup
import re

def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Extract title
    title_tag = soup.find('h1', class_='entry-title')
    title = title_tag.get_text(strip=True) if title_tag else None
    
    # Extract publication date
    date_div = soup.find('div', class_='single-post-date')
    pub_date = None
    if date_div:
        date_text = date_div.get_text(strip=True)
        # Try to extract date in YYYY-MM-DD format
        date_match = re.search(r'(\w+ \d{1,2}, \d{4}|\d{4}-\d{2}-\d{2})', date_text)
        if date_match:
            from datetime import datetime
            try:
                pub_date = datetime.strptime(date_match.group(1), '%B %d, %Y').strftime('%Y-%m-%d')
            except ValueError:
                try:
                    pub_date = datetime.strptime(date_match.group(1), '%Y-%m-%d').strftime('%Y-%m-%d')
                except:
                    pub_date = None
    
    # Extract content
    content_div = soup.find('div', class_='entry-content-wrapper')
    content = []
    if content_div:
        # Skip header elements and extract text from all relevant tags
        for element in content_div.find_all(['p', 'ul', 'ol', 'h2', 'h3', 'h4', 'div']):
            if 'single-post-header' in element.get('class', []):
                continue
            if element.name in ['h2', 'h3', 'h4']:
                content.append(element.get_text(strip=True))
            elif element.name in ['ul', 'ol']:
                for li in element.find_all('li'):
                    content.append(li.get_text(strip=True))
            elif element.name == 'div':
                # Handle divs that might contain text or images with captions
                img = element.find('img')
                if img and img.get('alt'):
                    content.append(img['alt'])
                caption = element.find('figcaption')
                if caption:
                    content.append(caption.get_text(strip=True))
                text = element.get_text(strip=True)
                if text and not element.find(['img', 'iframe']):
                    content.append(text)
            else:
                text = element.get_text(strip=True)
                if text:
                    content.append(text)
    
    # Join content with newlines and clean up
    content = '\n'.join([line for line in content if line.strip()])
    
    return {
        'title': title,
        'pub_date': pub_date,
        'content': content
    }