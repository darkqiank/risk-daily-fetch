from readability import Document
from bs4 import BeautifulSoup
def get_content(_content):
    xml_soup = BeautifulSoup(_content, 'lxml-xml')
    # print("xml_soup", xml_soup)
    fullArticleDTO = xml_soup.find('FullArticleDTO')
    # print("fullArticleDTO", fullArticleDTO)
    title = fullArticleDTO.find('title').text
    _base_html_text = fullArticleDTO.find('text').text
    doc = Document(_base_html_text)
    # 获取文章的标题
    summary_html = doc.summary()
    soup = BeautifulSoup(summary_html, 'html.parser')
    inner_text = soup.get_text(separator='\n')  # Using separator for better readability
    return {
        "title": title,
        "pub_date": "",
        "content": inner_text   
    }
