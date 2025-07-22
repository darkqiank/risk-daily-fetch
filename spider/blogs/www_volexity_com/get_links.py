import bs4
from urllib.parse import urljoin

def get_links(_content: str) -> list:
    """
    从给定的HTML内容中解析并提取博客文章链接列表。

    :param _content: str格式的HTML内容。
    :return: 包含文章链接的Python列表。
    """
    base_netloc = "https://www.volexity.com"
    
    soup = bs4.BeautifulSoup(_content, 'html.parser')
    
    # 定位包含博客文章列表的主内容区域
    # 这个区域的class是 'mgpb-listing__main'
    main_content_div = soup.find('div', class_='mgpb-listing__main')
    
    if not main_content_div:
        return []

    # 使用集合来存储链接以自动处理重复项
    unique_links = set()

    # 在主内容区域内查找所有文章条目
    # 每个文章条目都是一个 <article> 标签，带有 'card card--post' 类
    articles = main_content_div.find_all('article', class_='card--post')
    
    for article in articles:
        # 文章的标题链接在一个 <a> 标签中，带有 'card__heading' 类
        link_tag = article.find('a', class_='card__heading')
        
        if link_tag and link_tag.get('href'):
            href = link_tag.get('href').strip()
            
            # 判断链接是否是绝对路径，如果不是，则与base_netloc拼接
            if href.startswith('http'):
                full_link = href
            else:
                full_link = urljoin(base_netloc, href)
            
            unique_links.add(full_link)
            
    # 将集合转换为列表后返回
    links = list(unique_links)
    return links