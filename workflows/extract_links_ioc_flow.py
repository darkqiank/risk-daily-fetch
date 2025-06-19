from prefect import task, flow
from prefect.states import Failed
from prefect.logging import get_logger
from prefect.runtime import flow_run, task_run
import sys
from pathlib import Path
import time
import uuid
import asyncio
import dotenv

# Add the project root directory to Python path
sys.path.append(str(Path(__file__).parent.parent))
from spider.base.url_extract_ioc_spider import UrlExtractIOCSpider


dotenv.load_dotenv()
logger = get_logger()

u_spider = UrlExtractIOCSpider(logger=logger)

# 生成 flow 的 id
def generate_ioc_flow_id() -> str:
    flow_name = flow_run.flow_name
    parameters = flow_run.parameters
    name = parameters["blog_name"]
    return f"{flow_name}_{name}_{int(time.time()*1000)}_{str(uuid.uuid4())[:8]}"

# 解析网页内容
@flow(flow_run_name=generate_ioc_flow_id, log_prints=True)
async def parse_content(blog_name: str, link: str, use_proxy: bool = False, use_cache: bool = False):
    try:
        return await u_spider.parse_content(blog_name, link, use_proxy, use_cache)
    except Exception as e:
        return Failed(message=f"{e}")

# 提交到 IOCGPT
@task(flow_run_name=generate_ioc_flow_id, log_prints=True)
async def submit_to_iocgpt(blog_name: str, content: str):
    try:
        return await u_spider.submit_to_iocgpt(content)
    except Exception as e:
        return Failed(message=f"{e}")

# 大模型解读内容
@task(flow_run_name=generate_ioc_flow_id, log_prints=True)
async def llm_read(blog_name: str, content: str):
    try:
        return await u_spider.llm_read(content)
    except Exception as e:
        return Failed(message=f"{e}")

# 提取 IOC 的 完整flow
@flow(flow_run_name=generate_ioc_flow_id, log_prints=True)
async def extract_ioc_flow(blog_name: str, link: str, use_proxy: bool = False, use_cache: bool = False):
    # 解析网页内容
    content_state = await parse_content(blog_name, link, use_proxy, use_cache, return_state=True)
    if content_state.is_failed():
        logger.error(f"解析内容失败: {content_state.message}")
        return content_state
    
    content_res = await content_state.result()
    logger.info(f"解析内容成功: {content_res.get("title")}")

    _content = content_res.get("content")

    # 大模型解读内容
    llm_future = await llm_read(blog_name, _content, return_state=True)
    if llm_future.is_failed():
        logger.error(f"大模型解读内容失败: {llm_future.message}")
    else:
        llm_res = await llm_future.result()
        logger.info(f"大模型解读内容成功: {llm_res}")

    # 提交到 IOCGPT
    ioc_state = await submit_to_iocgpt(blog_name, _content, return_state=True)
    if ioc_state.is_failed():
        logger.error(f"提交到 IOCGPT 失败: {ioc_state.message}")
    else:
        ioc_res = await ioc_state.result()
        logger.info(f"提交到 IOCGPT 成功: {ioc_res}")



if __name__ == "__main__":
    asyncio.run(extract_ioc_flow(blog_name="default", link="https://blog.xlab.qianxin.com/gayfemboy-en/"))