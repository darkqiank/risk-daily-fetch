from bs4 import BeautifulSoup

def get_links(_content):
    base_netloc = "https://www.daj.jp"
    soup = BeautifulSoup(_content, 'html.parser')
    links = []
    
    # 定位正文部分 - 这里假设正文链接在class为"Content"的div中
    content_div = soup.find('div', class_='Content')
    if content_div:
        for a_tag in content_div.find_all('a', href=True):
            href = a_tag['href']
            if href.startswith('http'):
                links.append(href)
            else:
                links.append(base_netloc + href if not href.startswith('/') else base_netloc + href)
    
    return links