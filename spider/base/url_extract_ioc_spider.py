import importlib
import os
from typing import Any, Dict, List
import aiohttp
import sys
from pathlib import Path
import logging
import asyncio
import asyncpg
import ast
import json
from datetime import datetime, timedelta, timezone

# Add the project root directory to Python path
sys.path.append(str(Path(__file__).parent.parent))

from spider.iocgpt.ioc_format import standardize_iocs

default_logger = logging.getLogger(__name__)

# 时间转换函数
def convert_to_china_time(utc_time_str):
    utc_time = datetime.strptime(utc_time_str, "%Y-%m-%dT%H:%M:%S.%f+00:00")
    # Make it timezone-aware as UTC first, then convert to China time
    utc_time = utc_time.replace(tzinfo=timezone.utc)
    china_tz = timezone(timedelta(hours=8))
    china_time = utc_time.astimezone(china_tz)
    # Return timezone-naive datetime for timestamp field
    return china_time.replace(tzinfo=None)

class UrlExtractIOCSpider:
    def __init__(self, logger = default_logger, db_pool: asyncpg.Pool = None):
        self.logger = logger
        self.db_pool = db_pool

    async def init_db_pool(self, dsn: str):
        self.db_pool = await asyncpg.create_pool(dsn, min_size=1, max_size=5)

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
            if raw_content is None:
                use_proxy = not use_proxy
                self.logger.info(f"切换代理模式: {use_proxy}")
                raw_content = await module.a_fetch_url(link, use_proxy=use_proxy)
                if raw_content is None:
                    self.logger.error(f"切换代理模式后，链接内容抓取失败: {link}")
                    raise ValueError(f"切换后二次抓取失败")
            content_res = module.get_content(raw_content)
            if content_res is None:
                self.logger.error(f"解析内容为空: {link}")
                raise ValueError(f"解析内容为空")
            return content_res.get("content")
        except Exception as e:
            raise ValueError(f"{link} 链接内容抓取失败: {e}")
    
    async def submit_to_iocgpt(self, content: str):
        """
        通过大模型提取ioc
        """
        try:
            ioc_url = os.getenv("IOC_URL")
            ioc_api_key = os.getenv("IOC_API_KEY")
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    ioc_url,
                    headers={"Authorization": f"Bearer {ioc_api_key}"},
                    json={"messages": [{'role': 'user', 'content': content}]},
                    timeout=500
                ) as response:
                    response.raise_for_status()
                    res_json = await response.json()
                    self.logger.info(f"大模型提取ioc结果: {res_json}")
                    return res_json
        except Exception as e:
            self.logger.error(f"提交到 IOCGPT 失败: {str(e)}")
            raise ValueError(f"提交到 IOCGPT 失败: {str(e)}")
    

    async def save_iocs_to_db(self, data: List[Dict[str, Any]]):
        """
        通过异步保存到数据库
        """
        upsert_query = """
        INSERT INTO threat_intelligence (url, content, inserted_at, source, extraction_result)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (url) 
        DO UPDATE SET
            content = EXCLUDED.content,
            inserted_at = EXCLUDED.inserted_at,
            source = EXCLUDED.source,
            extraction_result = EXCLUDED.extraction_result;
        """
        if not self.db_pool:
            raise ValueError(f"未配置数据库")
        
        async with self.db_pool.acquire() as connection:
            async with connection.transaction():
                for record in data:
                    try:
                        if record.get("inserted_at"):
                            china_time = convert_to_china_time(record["inserted_at"])
                        else:
                            # Get current China time as timezone-naive datetime
                            utc_now = datetime.now(timezone.utc)
                            china_tz = timezone(timedelta(hours=8))
                            china_time = utc_now.astimezone(china_tz).replace(tzinfo=None)
                        
                        extraction_json = json.dumps(record["extraction_result"], ensure_ascii=False)
                        await connection.execute(upsert_query,
                            record["url"],
                            record["content"],
                            china_time,
                            record["source"],
                            extraction_json
                        )
                    except Exception as e:
                        self.logger.error(f"Error inserting record: {e}")
                        raise  # 重新抛出异常，让事务回滚
    
    async def send_iocs_to_kafka(self, data: List[Dict[str, Any]]):
        """
        发送 IOC 到 Kafka
        """
        iocs = standardize_iocs(data)
        pass


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
            self.logger.error(f"提交到 大模型解读 失败: {str(e)}")
            raise ValueError(f"提交到 大模型解读 失败: {str(e)}")
    
        
    async def save_content_details_to_db(self, data: List[Dict[str, Any]]):
        """
        保存内容详情
        """
        import aiohttp
        end_point = os.getenv("DB_ENDPOINT")
        url = f'{end_point}/api/detail'
        print(url)
        headers = {
            'X-AUTH-KEY': os.getenv("DB_AUTH_KEY"),
            'Content-Type': 'application/json'
        }
        try:
            # 保存数据
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    url, 
                    headers=headers,
                    json=data, 
                    timeout=30
                ) as response:
                    response.raise_for_status()
                    return await response.json()
        except Exception as e:
            self.logger.error(f"保存数据失败: {str(e)}")
            raise Exception(f"保存数据失败: {str(e)}")