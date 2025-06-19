from fast_readability import Readability
from bs4 import BeautifulSoup

def get_content(_content):
    reader = Readability()
    result = reader.extract_from_html(_content)
    summary_html = result.get("content", "")
    soup = BeautifulSoup(summary_html, 'html.parser')
    inner_text = soup.get_text(separator='\n')  # Using separator for better readability
    return {
        "title": result.get("title", ""),
        "pub_date": "",
        "content": inner_text   
    }