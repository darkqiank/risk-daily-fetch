import importlib
import sys
from pathlib import Path
from typing import Any, Dict, List
import os
import logging

# Add the project root directory to Python path
sys.path.append(str(Path(__file__).parent.parent))


class BlogLinkSpider:
    def __init__(self, logger = logging.getLogger(__name__)):
        self.logger = logger


    async def _save_to_db(self, data: List[Dict[str, Any]]) -> None:
        import aiohttp
        end_point = os.getenv("DB_ENDPOINT")
        url = f'{end_point}/api/blog'
        print(url)
        headers = {
            'X-AUTH-KEY': os.getenv("DB_AUTH_KEY"),
            'Content-Type': 'application/json'
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                url, 
                headers=headers,
                json=data, 
                timeout=30
            ) as response:
                response.raise_for_status()
                return await response.json()


    async def save_links(self, blog_name: str, links: List[str]):
        try:
            self.logger.info(f"保存数据: {blog_name} 链接数: {len(links)}")
            return await self._save_to_db({blog_name: links})
        except Exception as e:
            raise Exception(f"保存数据失败: {str(e)}， 爬取数据数: {len(links)}")


    async def parse_links(self, blog_name: str, use_proxy: bool = False):
        # 动态导入模块
        try:
            module_name = f"spider.blogs.{blog_name}"
            module = importlib.import_module(module_name)
        except Exception as e:
            raise ValueError(f"模块导入失败: {e}")
        
        try:
            raw_content = await module.a_fetch_url(module.BASE_URL, use_proxy=use_proxy)
            links = module.get_links(raw_content)
            # 去重
            links = list(set(links))
            self.logger.info(f"爬取数据: {blog_name} 链接数: {len(links)}")
            await self.save_links(blog_name, links)
            return links
        except Exception as e:
            raise ValueError(f"{blog_name} 链接抓取失败: {e}")
    

    async def parse_links_old(self, blog_name: str, blog_language: str, use_proxy: bool = False):
        # 动态导入模块
        try:
            # 动态导入爬虫子模块
            module_name = f"spider.blogs_old.{blog_language}.{blog_name}"
            module = importlib.import_module(module_name)

            links = module.get_links(use_proxy=use_proxy)
            self.logger.info(f"爬取数据: {blog_name} 链接数: {len(links)}")
            await self.save_links(blog_name, links)
            return links
        except Exception as e:
            raise ValueError(f"{blog_name} 链接抓取失败: {e}")