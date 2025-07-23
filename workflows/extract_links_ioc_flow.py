from typing import Any, Dict, List
from prefect import get_run_logger, task, flow
from prefect.states import Failed
from prefect.logging import get_logger
from prefect.runtime import flow_run, task_run
from prefect.context import TaskRunContext
import sys
from pathlib import Path
import time
import uuid
import asyncio
import dotenv
from prefect import serve, flow
from prefect.states import State, Failed, Completed
from prefect.cache_policies import INPUTS, TASK_SOURCE
import os
from datetime import datetime, timezone
from datetime import timedelta
import json
import re

# Add the project root directory to Python path
sys.path.append(str(Path(__file__).parent.parent))
from spider.base.AsyncYoumengSpider import AsyncYoumengSpider
from spider.base.url_extract_ioc_spider import UrlExtractIOCSpider
from spider.utils import hash_data
from workflows.cache import local_block


dotenv.load_dotenv()

# 全局变量用于存储spider实例
_spider_instance = None

async def get_spider_instance():
    """获取单例的spider实例，确保数据库连接池正确初始化"""
    global _spider_instance
    if _spider_instance is None:
        dsn = os.getenv("RISK_DATABASE_URL")
        _spider_instance = UrlExtractIOCSpider()
        await _spider_instance.init_db_pool(dsn)
    return _spider_instance

# 生成 flow 的 id
def generate_ioc_flow_id() -> str:
    flow_name = flow_run.flow_name
    parameters = flow_run.parameters
    name = parameters.get("blog_name", "default")
    return f"{flow_name}_{name}_{int(time.time()*1000)}_{str(uuid.uuid4())[:8]}"

def generate_ioc_task_id() -> str:
    task_name = task_run.task_name
    parameters = task_run.parameters
    name = parameters.get("blog_name", "default")
    return f"{task_name}_{name}_{int(time.time()*1000)}_{str(uuid.uuid4())[:8]}"


def universal_cache_key(context: TaskRunContext, inputs: dict) -> str:
    """通用缓存键函数，适用于所有任务"""
    # 如果明确要求不使用缓存，返回随机键
    if not inputs.get("use_cache", True):
        return f"nocache-{uuid.uuid4()}"
    
    # 提取共性参数：blog_name 是共有的，其他参数按需添加
    blog_name = inputs.get("blog_name", "default")
    
    # 根据任务名称和输入生成唯一键
    task_name = context.task.name
    if task_name == "parse_content":
        return f"{task_name}-{blog_name}-{hash_data(inputs.get('link'))}"
    elif task_name == "submit_to_iocgpt":
        return f"{task_name}-{blog_name}-{hash_data(inputs.get('content'))}"
    elif task_name == "llm_read":
        return f"{task_name}-{blog_name}-{hash_data(inputs.get('content'))}"
    else:
        # 默认行为（如 save_* 任务通常不需要缓存）
        return None

# 解析网页内容
@task(
    cache_expiration=timedelta(days=30),
    cache_key_fn=universal_cache_key,
    persist_result=True,
    result_storage=local_block,
    task_run_name=generate_ioc_task_id, 
    retries=3, 
    retry_delay_seconds=5,
    log_prints=True)
async def parse_content(blog_name: str, link: str, use_proxy: bool = False, use_cache: bool = True):
    u_spider = await get_spider_instance()
    return await u_spider.parse_content(blog_name, link, use_proxy, use_cache)


# 提交到 IOCGPT
@task(    
    cache_expiration=timedelta(days=30),
    cache_key_fn=universal_cache_key,
    persist_result=True,
    result_storage=local_block,
    task_run_name=generate_ioc_task_id, 
    retries=1,
    retry_delay_seconds=10,
    log_prints=True)
async def submit_to_iocgpt(blog_name: str, content: str, use_cache: bool = True):
    u_spider = await get_spider_instance()
    return await u_spider.submit_to_iocgpt(content)


# 保存 IOC 到数据库, 有缓存，如果缓存了则不重复写入
@task(
    cache_expiration=timedelta(days=3),
    cache_policy= TASK_SOURCE + INPUTS,
    persist_result=True,
    result_storage=local_block,
    task_run_name=generate_ioc_task_id, log_prints=True)
async def save_iocs_to_db(blog_name: str, data: list):
    u_spider = await get_spider_instance()
    return await u_spider.save_iocs_to_db(data)


# 大模型解读内容
@task(
    cache_expiration=timedelta(days=30),
    cache_key_fn=universal_cache_key,
    persist_result=True,
    result_storage=local_block,
    retries=1,
    retry_delay_seconds=10,
    task_run_name=generate_ioc_task_id, log_prints=True)
async def llm_read(blog_name: str, content: str, use_cache: bool = True):
    u_spider = await get_spider_instance()
    return await u_spider.llm_read(content)
    

# 保存内容详情
@task(  cache_expiration=timedelta(days=3),
        cache_policy= TASK_SOURCE + INPUTS,
        persist_result=True,
        result_storage=local_block,
        task_run_name=generate_ioc_task_id, log_prints=True)
async def save_content_details_to_db(blog_name: str, data: list):
    u_spider = await get_spider_instance()
    return await u_spider.save_content_details_to_db(data)


# 提取 IOC 的 完整flow
@flow(flow_run_name=generate_ioc_flow_id, log_prints=True)
async def extract_ioc_flow(blog_name: str, link: str, use_proxy: bool = False, use_cache: bool = True):
    failed_tasks = []
    logger = get_run_logger()

    #########################################################
    # 解析网页内容
    logger.info(f"开始解析内容: {link}")
    try:
        content_res = await parse_content(blog_name, link, use_proxy, use_cache)
    except Exception as e:
        logger.error(f"解析内容失败: {e}")
        raise e
    
    if content_res is None:
        logger.error(f"解析内容为空: {link}")
        raise ValueError(f"解析内容为空: {link}")
    
    if isinstance(content_res, str):
        _content = content_res
    else:
        _content = content_res.get("content")
    
    if _content is None or _content == "":
        logger.error(f"解析内容为空: {link}")
        raise ValueError(f"解析内容为空: {link}")

    #########################################################

    # 提交到 IOCGPT
    threaten_result = {
        "url": hash_data(_content),
        "content": _content,
        "source": link
    }

    try:
        ioc_data = await submit_to_iocgpt(blog_name, _content, use_cache=use_cache)
        # threaten_result["inserted_at"] = datetime.now(timezone.utc).isoformat()
        threaten_result["extraction_result"] = ioc_data
        logger.info(f"提交到 IOCGPT 成功: {ioc_data}")
    except Exception as e:
        logger.error(f"提交到 IOCGPT 失败: {e}")
        raise e

    
    # 保存 IOC 到数据库
    try:
        await save_iocs_to_db(blog_name, [threaten_result])
    except Exception as e:
        logger.error(f"保存 IOC 到数据库失败: {e}")
        raise e
    
    #########################################################

    content_detail = {
        "url": link,
        "content": _content,
        "contentHash": hash_data(_content),
        "sourceType": "blog" if "微信公众号" not in blog_name else "biz",
        "source": blog_name
    }

    # 大模型解读内容
    try:
        llm_res = await llm_read(blog_name, _content, use_cache=use_cache)
        logger.info(f"大模型解读内容成功: {llm_res}")
        content_detail["detail"] = llm_res
    except Exception as e:
        logger.error(f"大模型解读内容失败: {e}")
        raise e
    
    # 保存内容详情
    try:
        await save_content_details_to_db(blog_name, [content_detail])
    except Exception as e:
        logger.error(f"保存内容详情失败: {e}")
        raise e
    
    return True


# 批量提取链接IOC
@flow(flow_run_name=generate_ioc_flow_id, log_prints=True)
async def extract_links_ioc_flow(max_concurrent: int = 3):
    """
    批量提取链接IOC，支持并发控制
    
    Args:
        max_concurrent: 最大并发数，默认3
    """
    logger = get_run_logger()
    u_spider = await get_spider_instance()
    u_spider.logger = logger

    import aiohttp
    # 获取链接
    blog_feed_url = os.getenv("BLOG_FEED_URL")
    async def get_blog_links() -> List[Dict[str, Any]]:
        """
        获取博客链接
        """
        async with aiohttp.ClientSession() as session:
            async with session.get(blog_feed_url, timeout=30) as response:
                res = await response.json()
                return res.get("data", [])
    
    blog_links = await get_blog_links()
    logger.info(f"获取到 {len(blog_links)} 个链接，最大并发数: {max_concurrent}")

    # 获取微信公众链接
    wechat_feed_url = os.getenv("WECHAT_FEED_URL")
    async def get_wechat_links() -> List[Dict[str, Any]]:
        """
        获取微信公众链接
        """
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.get(wechat_feed_url, timeout=30) as response:
                res = await response.json()
                return res.get("data", [])
    
    bizs = await get_wechat_links()
    for biz in bizs:
        url = biz.get('url')
        https_url = re.sub(r'^http://', 'https://', url)
        nickname = biz.get('nickname')
        if nickname != "央视财经":
            blog_links.append({
                "blog_name": f'微信公众号-{nickname}',
                "url": https_url
            })
    logger.info(f"添加微信公众号后，获取到 {len(blog_links)} 个链接")

    
    # 创建信号量来控制并发
    semaphore = asyncio.Semaphore(max_concurrent)
    
    async def process_single_link(blog_link: Dict[str, Any]):
        """处理单个链接，使用信号量控制并发"""
        async with semaphore:
            blog_name = blog_link.get("blog_name")
            blog_url = blog_link.get("url")
            
            try:
                res = await extract_ioc_flow(blog_name, blog_url, use_proxy=True, use_cache=True)
                return {"success": True, "link": blog_link}
            except Exception as e:
                logger.error(f"处理异常: {blog_name} - {str(e)}")
                return {"success": False, "link": blog_link}
    
    # 并发处理所有链接
    tasks = [process_single_link(blog_link) for blog_link in blog_links]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    
    # 统计结果
    success_count = 0
    failed_links = []
    
    for result in results:
        if isinstance(result, Exception):
            failed_links.append({"error": str(result)})
        elif result.get("success", False):
            success_count += 1
        else:
            failed_links.append(result["link"])
    
    run_result = {
        "total": len(blog_links),
        "success": success_count,
        "failed": len(failed_links),
        "failed_links": failed_links
    }
    
    logger.info(f"处理完成: 总数 {run_result['total']}, 成功 {run_result['success']}, 失败 {run_result['failed']}")
    if len(failed_links)>0:
        return Completed(name="CompletedWithFailed",message=json.dumps(run_result, ensure_ascii=False));
    else:
        return run_result;


# 大模型读取天际友盟数据
@flow(flow_run_name=generate_ioc_flow_id, log_prints=True)
async def read_ym_data_flow():
    logger=get_run_logger()
    ym_spider = AsyncYoumengSpider(logger=logger)
    u_spider = await get_spider_instance()
    u_spider.logger = logger
    ym_items = await ym_spider.informationList()

    if len(ym_items) == 0:
        return Failed(message="天际友盟数据请求数据为空")
    
    @task(task_run_name=generate_ioc_task_id,
          cache_policy= TASK_SOURCE + INPUTS,
          cache_expiration=timedelta(days=30),
          persist_result=True,
          result_storage=local_block,    
          retries=3, 
          retry_delay_seconds=5,
          log_prints=True)
    async def ym_detail_task(_id: str):
        return await ym_spider.informationDetail(_id)
    
    failed_tasks = []
    success_count = 0
    for ym_item in ym_items:
        ym_detail = await ym_detail_task(ym_item.get("id"))
        if not ym_detail:
            ym_detail = ym_item
        _content = f'{ym_detail.get("title")} {ym_detail.get("description")}'
        content_detail = {
            "url": ym_detail.get("refInfo") or ym_detail.get("id"),
            "source": "天际友盟",
            "sourceType": "blog",                   
            "content": _content,
            "contentHash": hash_data(f'{ym_detail.get("title")} {ym_detail.get("description")}'),
        }

        # 大模型解读内容
        try:
            llm_res = await llm_read("天际友盟", _content, use_cache=True)
            logger.info(f"大模型解读内容成功: {llm_res}")
            content_detail["detail"] = llm_res
        except Exception as e:
            logger.error(f"大模型解读内容失败: {e}")
            failed_tasks.append({"id": ym_item.get("id"), "title": ym_item.get("title"), "message": e})

        # 保存内容详情
        try:
            await save_content_details_to_db("天际友盟", [content_detail])
            success_count += 1
            logger.info(f"保存内容详情成功")
        except Exception as e:
            logger.error(f"保存内容详情失败: {e}")
            failed_tasks.append({"id": ym_item.get("id"), "title": ym_item.get("title"), "message": e})
        
        await asyncio.sleep(1)

    run_result = {
        "total": len(ym_items),
        "success": success_count,
        "failed": len(failed_tasks),
        "failed_links": failed_tasks
    }

    if len(failed_tasks)>0:
        return Completed(name="CompletedWithFailed",message=json.dumps(run_result, ensure_ascii=False));
    else:
        return run_result;


# 大模型读取twitter数据
@flow(flow_run_name=generate_ioc_flow_id, log_prints=True)
async def read_twitter_data_flow():
    logger=get_run_logger()
    u_spider = await get_spider_instance()
    u_spider.logger = logger

    twitter_feed_url = os.getenv("TWITTER_FEED_URL")
    async def get_twitter_links() -> List[Dict[str, Any]]:
        """
        获取twitter链接
        """
        import aiohttp
        async with aiohttp.ClientSession() as session:
            async with session.get(twitter_feed_url, timeout=30) as response:
                res = await response.json()
                return res.get("url", [])
    
    twitter_links = await get_twitter_links()
    logger.info(f"获取到 {len(twitter_links)} 个链接")

    failed_tasks = []
    success_count = 0

    for twitter_link in twitter_links:
        source = twitter_link.get("source")
        _url = twitter_link.get("url")
        if _url.startswith("https://") or _url.startswith("http://"):
            try:
                content_res = await parse_content(source, _url, use_proxy=True, use_cache=True)
                if isinstance(content_res, str):
                    _content = content_res
                else:
                    _content = content_res.get("content")
            except Exception as e:
                logger.error(f"解析内容失败: {e}")
                failed_tasks.append(f"{source} - {e}")
                continue
        else:
            _content = _url
            
        twitter_result = {
            "url": hash_data(_content),
            "content": _content,
            "source": source,
        }

        # 提取iocgpt
        try:
            ioc_data = await submit_to_iocgpt(source, _content, use_cache=True)
            # twitter_result["inserted_at"] = datetime.now(timezone.utc).isoformat()
            twitter_result["extraction_result"] = ioc_data
            logger.info(f"提交到 IOCGPT 成功: {ioc_data}")
        except Exception as e:
            logger.error(f"提交到 IOCGPT 失败: {e}")
            failed_tasks.append(f"{source} - {e}")
            continue

        # 保存 IOC 到数据库
        try:
            await save_iocs_to_db(source, [twitter_result])
            success_count += 1
            logger.info(f"保存 IOC 到数据库成功")
        except Exception as e:
            logger.error(f"保存 IOC 到数据库失败: {e}")
            failed_tasks.append(f"{source} - {e}")
            continue
        
        await asyncio.sleep(1)
    
    run_result = {
        "total": len(twitter_links),
        "success": success_count,
        "failed": len(failed_tasks),
        "failed_links": failed_tasks
    }

    if len(failed_tasks)>0:
        return Completed(name="CompletedWithFailed",message=json.dumps(run_result, ensure_ascii=False));
    else:
        return run_result;
    


if __name__ == "__main__":
    asyncio.run(extract_ioc_flow(blog_name="default", link="https://blog.xlab.qianxin.com/gayfemboy-en/"))
    # 本地process部署