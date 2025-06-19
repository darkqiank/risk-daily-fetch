import importlib
import os
import aiohttp
import sys
from pathlib import Path
import logging

# Add the project root directory to Python path
sys.path.append(str(Path(__file__).parent.parent))


class UrlExtractIOCSpider:
    def __init__(self, logger: logging.Logger):
        self.logger = logger

    async def parse_content(self, blog_name: str, link: str, use_proxy: bool = False, use_cache: bool = False):
        # 动态导入模块
        try:
            module_name = f"spider.blogs.{blog_name}"
            module = importlib.import_module(module_name)
        except Exception as e:
            self.logger.error(f"导入模块失败: {str(e)}, 使用默认的爬虫子模块")
            # raise ValueError(f"模块导入失败: {e}")
            module_name = "spider.blogs.universal_parse"
            module = importlib.import_module(module_name)
        
        try:
            raw_content = await module.a_fetch_url(link, use_proxy=use_proxy)
            content = module.get_content(raw_content)
            return content
        except Exception as e:
            raise ValueError(f"{link} 链接内容抓取失败: {e}")
    

    async def submit_to_iocgpt(self, content: str):
        """
        通过接口提交到 IOCGPT
        """
        try:
            """提交获取文章内容的IOC任务"""
            api = os.getenv("IOC_SUBMIT_API")
            key = os.getenv("IOC_SUBMIT_KEY")
            headers = {"Authorization": f"Bearer {key}"}
            data = {
                "urls": [content]
            }
            async with aiohttp.ClientSession() as session:
                async with session.post(api, headers=headers, json=data) as response:
                    return await response.json()
        except Exception as e:
            self.logger.error(f"提交到 IOCGPT 失败: {str(e)}")
            raise ValueError(f"提交到 IOCGPT 失败: {str(e)}")
    

    async def llm_read(self, content: str):
        """
        通过大模型解读内容
        """
        try:
            llm_read_url = os.getenv("LLM_READ_URL")
            llm_read_api_key = os.getenv("LLM_READ_API_KEY")
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    llm_read_url,
                    headers={"Authorization": f"Bearer {llm_read_api_key}"},
                    json={"messages": [{'role': 'user', 'content': content}]},
                ) as response:
                    response.raise_for_status()
                    res_json = await response.json()
                    content = res_json["choices"][0]["message"]["content"]
                    self.logger.info(f"大模型解读内容: {content}")
                    return content
        except Exception as e:
            self.logger.error(f"提交到 IOCGPT 失败: {str(e)}")
            raise ValueError(f"提交到 IOCGPT 失败: {str(e)}")
        