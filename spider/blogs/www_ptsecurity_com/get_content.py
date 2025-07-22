import re
from datetime import datetime
from bs4 import BeautifulSoup

def get_content(_content: str) -> dict:
    """
    从提供的HTML字符串中提取文章标题、发布日期和正文内容。

    Args:
        _content: 包含文章HTML内容的字符串。

    Returns:
        一个包含'title', 'pub_date', 和 'content'的字典。
    """
    article = {
        "title": "",
        "pub_date": "",
        "content": ""
    }
    
    if not _content:
        return article

    soup = BeautifulSoup(_content, 'html.parser')

    # 1. 提取文章标题
    # 优先使用<h1>标签，因为它通常是页面上可见的主标题。
    # CSS类名可能是动态生成的，所以直接查找标签更稳健。
    title_tag = soup.find('h1')
    if title_tag:
        article['title'] = title_tag.get_text(strip=True)
    # 如果找不到<h1>，则回退到<title>标签
    elif soup.title and soup.title.string:
        article['title'] = soup.title.string.strip()

    # 2. 提取发布时间
    # 时间通常在<time>标签中，这是最理想的情况。
    date_tag = soup.find('time')
    if date_tag:
        date_str = date_tag.get_text(strip=True)
        try:
            # 解析 "17 June 2025" 这种格式的日期
            dt_object = datetime.strptime(date_str, '%d %B %Y')
            article['pub_date'] = dt_object.strftime('%Y-%m-%d')
        except ValueError:
            # 如果日期格式不同，可以添加其他解析逻辑或保持为空
            article['pub_date'] = ""

    # 3. 提取正文内容
    # 文章正文通常包含在<article>语义化标签中。
    content_container = soup.find('article')
    if content_container:
        # 使用get_text并指定分隔符，可以优雅地处理段落、列表、标题和表格
        # 这能确保不同块级元素之间的文本不会粘连在一起。
        # strip=True会移除每个文本块前后的空白字符。
        raw_content = content_container.get_text(separator='\n', strip=True)
        
        # 清理多余的空行，使内容更整洁
        lines = (line.strip() for line in raw_content.splitlines())
        article['content'] = '\n'.join(line for line in lines if line)

    return article