import re
from datetime import datetime
from bs4 import BeautifulSoup

def get_content(_content: str) -> dict:
    """
    从提供的HTML字符串中提取文章标题、发布日期和正文内容。

    Args:
        _content: 包含HTML内容的字符串。

    Returns:
        一个包含'title', 'pub_date', 和 'content'的字典。
    """
    article = {
        'title': '',
        'pub_date': '',
        'content': ''
    }
    if not _content:
        return article

    soup = BeautifulSoup(_content, 'html.parser')

    # 1. 提取标题
    # <title>标签通常是最可靠的来源。
    try:
        if soup.title and soup.title.string:
            article['title'] = soup.title.get_text(strip=True)
        else:
            # 如果<title>标签无效或缺失，则回退到<h1>标签
            h1 = soup.find('h1')
            if h1:
                article['title'] = h1.get_text(strip=True)
    except Exception:
        pass  # 提取失败则保持为空

    # 2. 提取发布日期
    # 使用正则表达式查找常见的日期格式（如: Jul 21, 2025），以提高鲁棒性。
    try:
        # 匹配 "月份缩写 日, 年" 格式的正则表达式
        date_pattern = re.compile(
            r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},\s+\d{4}',
            re.IGNORECASE
        )
        # 在整个文档中搜索匹配该模式的文本
        date_tag_text = soup.find(string=date_pattern)
        if date_tag_text:
            match = date_pattern.search(date_tag_text)
            if match:
                date_str = match.group(0)
                # 解析并格式化日期
                dt_obj = datetime.strptime(date_str, "%b %d, %Y")
                article['pub_date'] = dt_obj.strftime("%Y-%m-%d")
    except Exception:
        pass  # 提取失败则保持为空

    # 3. 提取正文内容
    # 策略是找到最可能包含文章正文的容器。
    # 这里的HTML中，正文块带有'wysiwyg'类，这是一个很好的定位符。
    content_container = None
    main_area = soup.find('main')
    if not main_area:
        main_area = soup.body  # 如果没有<main>标签，则回退到<body>

    if main_area:
        # 优先策略: 查找包含多个 'wysiwyg' 内容块的父容器。
        # 这是一个很强的信号，表明该容器是主要内容区域。
        # 此处的CSS选择器 `div:has(> div.wysiwyg)` 意为“一个直接子元素是div.wysiwyg的div”。
        # 注意: :has() 选择器需要 beautifulsoup4>=4.12.0 和 soupsieve>=2.4。
        try:
            # 查找一个直接包含 'wysiwyg' 类的容器
            container = main_area.select_one('div:has(> div.wysiwyg)')
            if container:
                # 更进一步，查找包含最多 'wysiwyg' 块的那个父级，以应对嵌套结构
                potential_parents = container.find_parents('div')
                content_container = max(
                    [container] + potential_parents,
                    key=lambda p: len(p.select('div.wysiwyg'))
                )
        except Exception:
            # 如果 :has() 不支持，则执行回退策略
            pass
        
        # 回退策略: 如果上述策略失败，则直接收集所有 'wysiwyg' 块。
        if not content_container:
            content_blocks = main_area.select('div.wysiwyg')
            if content_blocks:
                # 创建一个临时的父标签来包裹所有内容块，以便统一处理
                temp_container = soup.new_tag("div")
                for block in content_blocks:
                    temp_container.append(block)
                content_container = temp_container

    if content_container:
        # 预处理表格：将<table>转换为格式化的纯文本，以满足需求
        for table in content_container.find_all('table'):
            table_lines = []
            for row in table.find_all('tr'):
                # 将单元格内容用空格连接，每行成为一个独立的字符串
                row_text = ' '.join(cell.get_text(strip=True) for cell in row.find_all(['td', 'th']))
                if row_text:
                    table_lines.append(row_text)
            # 用格式化后的文本替换整个<table>标签
            if table_lines:
                table.replace_with(soup.new_string('\n'.join(table_lines) + '\n'))

        # 使用 get_text 并指定分隔符，可以优雅地处理段落、列表等元素的换行
        article['content'] = content_container.get_text(separator='\n', strip=True)

    return article