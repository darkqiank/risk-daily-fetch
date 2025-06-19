from bs4 import BeautifulSoup
import re


def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Extract title
    title_tag = soup.find('h1')
    title = title_tag.text.strip() if title_tag else ""
    
    # Extract publication date
    pub_date = ""
    date_div = soup.find('div', class_='ab__text', string=re.compile('Published:'))
    if date_div:
        pub_date_text = date_div.text.strip()
        pub_date_match = re.search(r'Published:\s*(\w+\s+\d+,\s+\d{4})', pub_date_text)
        if pub_date_match:
            pub_date = pub_date_match.group(1)
    
    # Extract content
    content_section = soup.find('div', class_='be__contents-wrapper')
    content_paragraphs = []
    if content_section:
        for element in content_section.find_all(['p', 'h2', 'h3', 'ul', 'ol', 'table']):
            if element.name in ['h2', 'h3']:
                content_paragraphs.append(element.text.strip())
            elif element.name in ['ul', 'ol']:
                for li in element.find_all('li'):
                    content_paragraphs.append(li.text.strip())
            elif element.name == 'table':
                for row in element.find_all('tr'):
                    cells = [cell.text.strip() for cell in row.find_all(['td', 'th'])]
                    content_paragraphs.append(" | ".join(cells))
            else:
                content_paragraphs.append(element.text.strip())
    
    content = "\n".join(content_paragraphs)
    
    article = {
        'title': title,
        'pub_date': pub_date,
        'content': content
    }
    
    return article