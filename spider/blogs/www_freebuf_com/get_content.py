from bs4 import BeautifulSoup
import re

def get_content(_content):
    soup = BeautifulSoup(_content, 'html.parser')
    
    # 提取标题
    title_tag = soup.find('title')
    title = title_tag.text.strip() if title_tag else ''
    
    # 提取发布时间
    pub_date = ''
    date_tag = soup.find('span', class_='date')
    if date_tag:
        date_text = date_tag.text.strip()
        # 使用正则提取YYYY-MM-DD格式的日期
        date_match = re.search(r'(\d{4}-\d{2}-\d{2})', date_text)
        if date_match:
            pub_date = date_match.group(1)
    
    # 提取正文内容
    content_div = soup.find('div', class_='content-detail')
    content = []
    if content_div:
        # 提取所有文本节点
        for element in content_div.find_all(['p', 'h2', 'blockquote', 'img']):
            if element.name == 'img':
                # 处理图片
                alt_text = element.get('alt', '')
                if alt_text:
                    content.append(f"[图片: {alt_text}]")
            else:
                # 处理文本内容
                text = element.get_text(' ', strip=True)
                if text:
                    content.append(text)
    
    article = {
        'title': title,
        'pub_date': pub_date,
        'content': '\n'.join(content) if content else ''
    }
    
    return article