from pathlib import Path

TEMPLATES = {
    "__init__.py": """from .get_links import get_links
from .get_content import get_content

BASE_URL = {base_url_repr}

__all__ = ['get_links', 'get_content', 'BASE_URL']
""",
    "get_links.py": """
def get_links(html, base_url=None):
    return []
""",

    "get_content.py": """
def get_content(html):
    return None
"""
}


def create_module(module_name, url, output_dir=".generated_code"):
    """创建指定名称的模块

    参数:
        module_name (str): 模块名称
        output_dir (str): 输出目录路径
    """
    if not module_name.isidentifier():
        raise ValueError(f"无效的模块名称: {module_name}")
    # 创建模块目录
    module_path = Path(output_dir) / module_name
    module_path.mkdir(parents=True, exist_ok=True)
    # 生成文件
    for filename, content in TEMPLATES.items():
        file_path = module_path / filename
        # 特殊处理__init__.py文件
        if filename == "__init__.py":
            formatted_content = content.format(base_url_repr=repr(url))
        else:
            formatted_content = content
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(formatted_content)
    return module_path

