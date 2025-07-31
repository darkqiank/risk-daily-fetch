import lxml.html
from urllib.parse import urljoin

def get_links(_content: str) -> list:
    """
    从给定的 HTML 内容中提取正文部分的博客文章链接。

    Args:
        _content: 包含博客文章列表的 HTML 字符串。

    Returns:
        一个列表，包含按时间顺序排列的完整博客文章链接。
    """
    base_netloc = "https://www.sysdig.com"
    
    doc = lxml.html.fromstring(_content)
    
    # XPath 表达式，用于定位所有博客文章列表项中的链接。
    # 它会查找 <main> 标签内，所有 class 包含 'w-dyn-item' 的 div（这些是文章的容器），
    # 然后在其中找到 class 包含 'u-position-absolute' 的 <a> 标签，并提取其 href 属性。
    # 这种方法可以精确地匹配正文中的文章链接，同时忽略导航栏、页脚等其他区域的链接。
    xpath_selector = "//main//div[contains(@class, 'w-dyn-item')]/a[contains(@class, 'u-position-absolute')]/@href"
    
    relative_links = doc.xpath(xpath_selector)
    
    links = []
    # 使用集合来防止重复添加相同的链接
    seen_links = set()
    
    for link in relative_links:
        # 使用 urljoin 确保所有链接都是以 http 开头的完整 URL
        full_link = urljoin(base_netloc, link)
        if full_link not in seen_links:
            links.append(full_link)
            seen_links.add(full_link)
            
    return links