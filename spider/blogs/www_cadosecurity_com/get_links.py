from bs4 import BeautifulSoup
from urllib.parse import urljoin

# 注：根据HTML内容，将base_netloc设置为实际域名以确保链接正确。
base_netloc = "https://www.darktrace.com"

def get_links(_content: str) -> list:
    """
    从HTML内容的正文部分提取按时间顺序排列的博客文章链接。

    - 仅提取<main>标签内的博客文章链接，以忽略导航栏和页脚。
    - 博客文章链接通过其href属性以"/blog/"开头来识别。
    - 使用set来处理重复链接，同时保持原始文档顺序。
    """
    soup = BeautifulSoup(_content, "html.parser")
    links = []
    seen = set()

    # 定位到包含博客文章的主体内容区域
    main_content = soup.find("main", class_="main-wrapper")

    if main_content:
        # 查找所有href以"/blog/"开头的<a>标签
        for a_tag in main_content.select('a[href^="/blog/"]'):
            href = a_tag.get("href")
            if href:
                # 拼接成完整的URL
                full_link = urljoin(base_netloc, href)
                # 如果链接未被添加过，则添加到列表和set中，以保持顺序并去重
                if full_link not in seen:
                    seen.add(full_link)
                    links.append(full_link)
    
    return links[:20]