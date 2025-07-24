import json
from typing import List

# 常量：定义基础域名
base_netloc = "https://reliaquest.com"

def get_links(_content: str) -> List[str]:
    """
    从给定的JSON字符串中解析并提取正文文章的链接列表。

    该函数会查找所有类型为'blogPost'的条目，提取其相对URL，
    并与base_netloc拼接成完整的URL。

    Args:
        _content: 包含文章列表的JSON格式字符串。

    Returns:
        一个包含所有正文文章完整链接的列表。
        如果解析失败或找不到有效链接，则返回空列表。
    """
    try:
        # 将JSON字符串解析为Python字典
        data = json.loads(_content)
        
        # 获取 'items' 键对应的值，如果不存在则返回一个空列表以避免错误
        items = data.get('items', [])
        
        # 使用列表推导式高效地提取和构建链接
        # 1. 遍历 items 列表中的每一个 item
        # 2. 检查 item 的 'type' 是否为 'blogPost'，确保只提取文章链接
        # 3. 检查 'url' 键是否存在于 item 中
        # 4. 如果满足条件，则将 base_netloc 和 item['url'] 拼接起来
        links = [
            base_netloc + item['url'] 
            for item in items 
            if item.get('type') == 'blogPost' and 'url' in item
        ]
        
        return links

    except json.JSONDecodeError:
        print("错误：输入的字符串不是有效的JSON格式。")
        return []
    except KeyError as e:
        print(f"错误：JSON数据中缺少预期的键: {e}")
        return []
    except Exception as e:
        print(f"发生未知错误: {e}")
        return []