from bs4 import BeautifulSoup
import re

def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Extract title
    title = soup.find('title').get_text(strip=True) if soup.find('title') else None
    
    # Extract publication date
    pub_date = None
    date_element = soup.find('p', class_='p small')
    if date_element:
        pub_date_text = date_element.get_text(strip=True)
        # Extract date in YYYY-MM-DD format
        date_match = re.search(r'\d{1,2}\s\w+\s\d{4}', pub_date_text)
        if date_match:
            from datetime import datetime
            pub_date = datetime.strptime(date_match.group(), '%d %B %Y').strftime('%Y-%m-%d')
    
    # Extract content
    content = []
    content_div = soup.find('span', id='hs_cos_wrapper_post_body')
    if content_div:
        for element in content_div.find_all(['p', 'h2', 'h3', 'li']):
            text = element.get_text(strip=True)
            if text:
                content.append(text)
    
    article = {
        'title': title,
        'pub_date': pub_date,
        'content': '\n'.join(content) if content else None
    }
    
    return article