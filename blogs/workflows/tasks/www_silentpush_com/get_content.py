from bs4 import BeautifulSoup
import re

def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    
    # Extract title
    title_tag = soup.find('h1', class_='entry-title')
    title = title_tag.get_text(strip=True) if title_tag else None
    
    # Extract publication date
    date_div = soup.find('div', class_='single-post-date')
    pub_date = date_div.get_text(strip=True) if date_div else None
    
    # Format date to YYYY-MM-DD if found
    if pub_date:
        try:
            # Extract month, day, year from text like "April 10, 2025"
            match = re.search(r'(\w+)\s(\d+),\s(\d{4})', pub_date)
            if match:
                month, day, year = match.groups()
                month_num = {
                    'January': '01', 'February': '02', 'March': '03', 'April': '04',
                    'May': '05', 'June': '06', 'July': '07', 'August': '08',
                    'September': '09', 'October': '10', 'November': '11', 'December': '12'
                }.get(month, '00')
                pub_date = f"{year}-{month_num}-{day.zfill(2)}"
        except:
            pub_date = None
    
    # Extract content
    content_div = soup.find('div', class_='entry-content-wrapper')
    content = []
    
    if content_div:
        # Process all relevant content elements
        for element in content_div.find_all(['p', 'h2', 'h3', 'ul', 'ol', 'div', 'figure', 'table']):
            # Skip elements that are part of metadata or navigation
            if element.find_parents(class_=['single-post-header', 'single-post-footer', 'related-posts-header']):
                continue
                
            # Handle different element types
            if element.name in ['h2', 'h3']:
                content.append(element.get_text(strip=True))
            elif element.name == 'ul':
                for li in element.find_all('li', recursive=False):
                    content.append(f"- {li.get_text(strip=True)}")
            elif element.name == 'ol':
                for i, li in enumerate(element.find_all('li', recursive=False), 1):
                    content.append(f"{i}. {li.get_text(strip=True)}")
            elif element.name == 'figure':
                # Handle images with captions
                img = element.find('img')
                caption = element.find('figcaption')
                if img:
                    content.append(f"[Image: {img.get('alt', '')}]")
                if caption:
                    content.append(caption.get_text(strip=True))
            elif element.name == 'table':
                # Handle tables by converting to text with newlines
                rows = []
                for row in element.find_all('tr'):
                    cells = [cell.get_text(strip=True) for cell in row.find_all(['th', 'td'])]
                    rows.append(" | ".join(cells))
                content.append("\n".join(rows))
            else:
                # Regular paragraphs
                text = element.get_text(strip=True)
                if text:  # Skip empty paragraphs
                    content.append(text)
    
    # Join all content with newlines
    content = "\n".join(content)
    
    # Create the result dictionary
    article = {
        'title': title,
        'pub_date': pub_date,
        'content': content
    }
    
    return article