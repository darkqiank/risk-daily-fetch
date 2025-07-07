import json

def get_links(_content):
    """
    从JSON数据中提取正文文章链接列表
    
    参数:
        _content (str): JSON格式的字符串内容
        
    返回:
        list: 包含完整URL的文章链接列表
    """
    base_netloc = "https://reliaquest.com"
    links = []
    
    try:
        # 解析JSON内容
        data = json.loads(_content)
        
        # 遍历items数组中的每个项目
        for item in data.get("items", []):
            # 只处理类型为blogPost的项目
            if item.get("type") == "blogPost":
                # 获取相对URL并拼接完整URL
                url = item.get("url")
                if url:
                    full_url = base_netloc + url
                    links.append(full_url)
                    
    except json.JSONDecodeError as e:
        print(f"JSON解析错误: {e}")
    except Exception as e:
        print(f"处理数据时发生错误: {e}")
        
    return links