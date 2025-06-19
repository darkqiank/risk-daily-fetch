import sys
from pathlib import Path
import importlib
from template import TEMPLATES, FETCH_TEMPLATES
import os
import re
from typing import Union
import shutil
from datetime import datetime
import json
from urllib.parse import urlparse


def create_module(module_name, url, base_netloc=None, output_dir=".generated_code", fetch="default", overwrite=False):
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
        if os.path.exists(file_path) and not overwrite:
            # 如果文件存在，且不覆写则跳过
            continue
        # 特殊处理__init__.py文件
        if filename == "__init__.py":
            if not base_netloc:
                parsed_url = urlparse(url)
                base_netloc = f"{parsed_url.scheme}://{parsed_url.netloc}"
            formatted_content = content.format(base_url_repr=repr(url), base_netloc_repr=repr(base_netloc))
        elif filename == "fetch_url.py":
            formatted_content = content.format(fetch_url_repr=FETCH_TEMPLATES[fetch])
        else:
            formatted_content = content
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(formatted_content)
    module = load_blog_module(output_dir, module_name)
    return module_path, module


def load_blog_module(_dir, blog_name):
    # 获取隐藏目录的绝对路径
    dir_path = Path(_dir).resolve()
    # 将该路径添加到sys.path
    if str(dir_path) not in sys.path:
        sys.path.insert(0, str(dir_path))
    # 导入模块
    module = importlib.import_module(blog_name)
    return module


def publish_module(module_name: str, source_dir: Path, target_dir: Path) -> bool:
    """发布模块到生产目录"""
    try:
        # 确保源目录存在
        source_path = source_dir / module_name
        if not source_path.exists():
            return False
            
        # 创建目标目录
        target_path = target_dir / module_name
        target_path.mkdir(parents=True, exist_ok=True)
        
        # 复制所有文件
        for item in source_path.glob('*'):
            if item.is_file():
                shutil.copy2(item, target_path)
        
        # 创建或更新发布信息
        publish_info = {
            "published_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "source": str(source_path),
            "target": str(target_path)
        }
        
        with open(target_path / "publish_info.json", "w", encoding="utf-8") as f:
            json.dump(publish_info, f, ensure_ascii=False, indent=2)
            
        return True
    except Exception as e:
        print(f"发布失败: {str(e)}")
        return False


# def run_code(code, func_name, arg1):
#     """执行代码并调用函数"""
#     namespace = {}
#     exec(code, namespace)
#     return namespace[func_name](arg1) if func_name in namespace else {"error": "执行失败"}

def run_code(code: str, func_name: str, **kwargs) -> Union[list, dict, None]:
    """通用代码执行函数，支持不同参数"""
    try:
        namespace = {}
        exec(code, namespace)
        func = namespace.get(func_name)
        return func(**kwargs) if func else None
    except Exception as e:
        print(f"代码执行错误: {str(e)}")
        return None


def extract_code_block(raw_code):
    match = re.search(r'```python\n(.*?)\n```', raw_code, re.DOTALL)
    return match.group(1).strip() if match else None
