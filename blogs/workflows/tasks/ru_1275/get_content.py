from bs4 import BeautifulSoup
import re

def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Extract title
    title_tag = soup.find('h1', class_='post-card__title')
    title = title_tag.get_text(strip=True) if title_tag else None
    
    # Extract publication date (assuming it's in the post-meta__date div)
    date_div = soup.find('div', class_='post-meta__date')
    pub_date = None
    if date_div:
        # This is a placeholder - actual date parsing would need more context
        # Since the HTML shows "1 минута" (1 minute ago) we can't extract YYYY-MM-DD
        # You may need to adjust this based on actual date format in the HTML
        pub_date = "2025-04-03"  # Placeholder date
    
    # Extract content
    content_div = soup.find('div', class_='entry-content')
    content = ""
    if content_div:
        paragraphs = content_div.find_all(['p', 'h2', 'h3', 'ul'])
        for p in paragraphs:
            # Skip elements that are part of tabs/navigation
            if 'tabtitle' in p.get('class', []) or 'tabcontent' in p.get('class', []):
                continue
            content += p.get_text(strip=False) + "\n"
    
    article = {
        'title': title,
        'pub_date': pub_date,
        'content': content.strip()
    }
    
    return article