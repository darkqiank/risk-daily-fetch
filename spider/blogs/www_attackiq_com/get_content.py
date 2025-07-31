import re
from bs4 import BeautifulSoup
from datetime import datetime

def get_content(_content: str) -> dict:
    """
    从提供的HTML字符串中提取文章标题、发布日期和正文内容。

    Args:
        _content: 包含文章的HTML内容的字符串。

    Returns:
        一个包含'title', 'pub_date', 和 'content'的字典。
    """
    soup = BeautifulSoup(_content, 'html.parser')
    
    article = {
        'title': None,
        'pub_date': None,
        'content': None,
    }

    # 1. 提取文章标题
    # 优先使用<h1>标签，其次是<title>标签
    title_tag = soup.select_one('h1.entry-title, h1.post-title, h1')
    if title_tag:
        article['title'] = title_tag.get_text(strip=True)
    else:
        title_tag = soup.find('title')
        if title_tag:
            article['title'] = title_tag.get_text(strip=True)

    # 2. 提取发布日期
    # 寻找带有 'datetime' 属性的 <time> 标签，这是最可靠的方式
    # 同时也检查meta标签作为备选方案
    date_str = None
    date_tag = soup.find('time', attrs={'datetime': True})
    if date_tag and date_tag.get('datetime'):
        date_str = date_tag['datetime']
    else:
        # 备选方案：从meta标签中查找
        meta_tags = soup.find_all('meta', attrs={'property': re.compile(r'article:published_time|og:published_time|publish_date')})
        if meta_tags:
            date_str = meta_tags[0].get('content')

    if date_str:
        try:
            # 尝试解析完整的ISO格式日期时间字符串
            # .replace('Z', '+00:00') 用于兼容Python老版本的fromisoformat
            article['pub_date'] = datetime.fromisoformat(date_str.replace('Z', '+00:00')).strftime('%Y-%m-%d')
        except ValueError:
            # 如果解析失败，使用正则表达式作为备用方案，提取 YYYY-MM-DD 格式
            match = re.search(r'(\d{4}-\d{2}-\d{2})', date_str)
            if match:
                article['pub_date'] = match.group(1)

    # 3. 提取正文内容
    # 使用一个选择器列表来定位主要内容容器，以提高代码的鲁棒性
    content_container = None
    selectors = [
        'div.entry-content',
        'div.post-content',
        'div.single-content',
        'div[itemprop="articleBody"]',
        'article.post',
        'article',
    ]
    for selector in selectors:
        candidate = soup.select_one(selector)
        if candidate:
            content_container = candidate
            break
    
    if not content_container:
        # 如果以上选择器都失败，尝试使用一个更通用的main标签
        content_container = soup.find('main')

    if content_container:
        # 在提取文本之前，移除常见的不需要的内容元素，如作者信息、分享按钮、相关文章等
        elements_to_remove = content_container.select("""
            .entry-footer, .post-navigation, .comments-area, .related-posts,
            [class*="author-bio"], [class*="author-box"], [class*="share-buttons"],
            [class*="social-links"], form, noscript, footer, header
        """)
        for el in elements_to_remove:
            el.decompose()

        # 使用 get_text 并设置 separator='\n'
        # 这可以确保文本块、列表项和表格单元格之间有换行符，防止内容粘连
        article['content'] = content_container.get_text(separator='\n', strip=True)

    return article