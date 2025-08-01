import re
from datetime import datetime
from bs4 import BeautifulSoup

def get_content(_content: str) -> dict:
    """
    从给定的HTML字符串中提取文章标题、发布时间和正文内容。

    Args:
        _content: 包含文章的HTML内容的字符串。

    Returns:
        一个包含'title', 'pub_date', 和 'content'的字典。
    """
    if not _content:
        return {
            'title': '',
            'pub_date': '',
            'content': ''
        }

    soup = BeautifulSoup(_content, 'html.parser')
    
    article = {}

    # 1. 提取标题 (Title)
    # 优先使用<h1>标签，因为它通常比<title>标签更纯粹（不含网站名称）
    title_tag = soup.find('h1')
    if title_tag:
        title = title_tag.get_text(strip=True)
    # 如果找不到<h1>，则回退到<title>标签
    elif soup.title and soup.title.string:
        title = soup.title.string.strip()
    else:
        title = ''
    article['title'] = title

    # 2. 提取发布日期 (Publication Date)
    pub_date = ''
    # 首先尝试寻找语义化的<time>标签
    time_tag = soup.find('time')
    date_str = ''
    if time_tag and time_tag.get('datetime'):
        date_str = time_tag.get('datetime')
    else:
        # 如果没有<time>标签，则在整个文档中用正则搜索日期格式
        # 这个正则表达式可以匹配 "Month Day, Year" 或 "Month Day Year" 等格式
        date_pattern = re.compile(
            r'(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}',
            re.IGNORECASE
        )
        match = date_pattern.search(soup.get_text())
        if match:
            date_str = match.group(0)

    if date_str:
        try:
            # 尝试解析ISO格式 (YYYY-MM-DDTHH:MM:SS)
            parsed_date = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            pub_date = parsed_date.strftime('%Y-%m-%d')
        except ValueError:
            # 如果ISO格式解析失败，尝试解析 "Month Day, Year" 文本格式
            clean_date_str = date_str.replace(',', '')
            for fmt in ('%B %d %Y', '%b %d %Y'):
                try:
                    parsed_date = datetime.strptime(clean_date_str, fmt)
                    pub_date = parsed_date.strftime('%Y-%m-%d')
                    break
                except ValueError:
                    continue
    article['pub_date'] = pub_date

    # 3. 提取正文内容 (Content)
    content = ''
    content_container = None
    
    # 定义一组候选的CSS选择器，按可能性从高到低排列
    selectors = [
        'div[class*="rich-text"]',
        'div[class*="blog-content"]',
        'div[class*="post-content"]',
        'div.entry-content',
        'div[class*="article-body"]',
        'div[class*="article__body"]',
        'div.main-content',
        'article'
    ]

    for selector in selectors:
        candidate = soup.select_one(selector)
        if candidate:
            # 使用一个启发式规则：一个好的内容容器应该包含多个段落或有足够的文本量
            if len(candidate.find_all('p', recursive=False)) > 2 or len(candidate.get_text(strip=True)) > 500:
                content_container = candidate
                break

    # 如果通过选择器没有找到，尝试一个更通用的方法：寻找h1标签的父节点中包含最多p标签的那个
    if not content_container and title_tag:
        best_parent = None
        max_p_count = -1
        # 向上查找5层父节点
        for parent in title_tag.find_parents(limit=5):
            # 排除body和html这种过于宽泛的标签
            if parent.name in ['body', 'html']:
                continue
            p_count = len(parent.find_all('p', recursive=False))
            if p_count > max_p_count:
                max_p_count = p_count
                best_parent = parent
        if max_p_count > 1: # 确保至少有几个段落
            content_container = best_parent

    if content_container:
        # 清理内容区域，移除常见的非正文元素（如分享按钮、相关文章、评论区、作者信息等）
        elements_to_remove_selectors = [
            '[class*="social"]', '[class*="share"]', '[class*="related"]',
            '[class*="comment"]', '[class*="author"]', '[class*="meta"]',
            '[class*="cta"]', '[class*="newsletter"]',
            'form', 'nav', 'footer', 'aside'
        ]
        for s in elements_to_remove_selectors:
            for unwanted_element in content_container.select(s):
                unwanted_element.decompose()
        
        # 提取文本，使用换行符分隔不同的块级元素，以保证内容不粘连
        content = content_container.get_text(separator='\n', strip=True)

    article['content'] = content

    return article