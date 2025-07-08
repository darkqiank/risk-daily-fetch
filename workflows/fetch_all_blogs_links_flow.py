# 将上级目录添加到系统目录
import os
import sys
from pathlib import Path
from prefect.logging import get_logger, get_run_logger
from prefect.runtime import flow_run
import time
import uuid
import json
sys.path.append(str(Path(__file__).parent.parent))

from spider.base.blog_link_spider import BlogLinkSpider
from prefect import flow
from prefect.states import State, Failed, Completed
import asyncio
from prefect import serve, flow

logger = get_logger()
blog_link_spider = BlogLinkSpider(logger=logger)


# 生成 flow 的 id
def generate_flow_id() -> str:
    flow_name = flow_run.flow_name
    parameters = flow_run.parameters
    name = parameters.get("blog_name", "default")
    return f"{flow_name}_{name}_{int(time.time()*1000)}_{str(uuid.uuid4())[:8]}"

# 获取博客链接
@flow(flow_run_name=generate_flow_id, retries=3, retry_delay_seconds=2.78)
async def fetch_blog_links_flow(blog_name: str, use_proxy: bool = False):
    result = await blog_link_spider.parse_links(blog_name, use_proxy=use_proxy)
    return result
    

# 获取旧版博客链接
@flow(flow_run_name=generate_flow_id, retries=3, retry_delay_seconds=2.78)
async def fetch_old_blog_links_flow(blog_name: str, blog_language: str, use_proxy: bool = False):
    result = await blog_link_spider.parse_links_old(blog_name, blog_language, use_proxy=use_proxy)
    return result


@flow(name="fetch_all_blogs_links_flow")
async def fetch_all_blogs_links_flow():
    blog_link_spider.logger = get_run_logger()
    # 从spider.blog 目录中获取博客名
    blog_names = []
    # 获取当前文件的目录
    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_names = os.listdir(os.path.join(current_dir, "../spider/blogs"))
    for file_name in file_names:
        if not file_name.endswith(".py") and not file_name.startswith("__") and not file_name.startswith("."):
            blog_names.append(file_name)
    
    # 从spider.blogs_old目录中获取博客名
    # 中文博客
    old_cn_blog_names = []
    old_file_names = os.listdir(os.path.join(current_dir, "../spider/blogs_old/cn"))
    for old_file_name in old_file_names:
        if old_file_name.endswith(".py") and not old_file_name.startswith("__"):
            module_name = os.path.splitext(os.path.basename(old_file_name))[0]
            old_cn_blog_names.append(module_name)
    
    # 英文博客
    old_en_blog_names = []
    old_file_names = os.listdir(os.path.join(current_dir, "../spider/blogs_old/en"))
    for old_file_name in old_file_names:
        if old_file_name.endswith(".py") and not old_file_name.startswith("__"):
            module_name = os.path.splitext(os.path.basename(old_file_name))[0]
            old_en_blog_names.append(module_name)

    # 统计结果
    success_count = 0
    failed_blogs = []

    # 获取博客链接
    for blog_name in blog_names:
        try:
            res_links = await fetch_blog_links_flow(blog_name, use_proxy=True)
            print(f"博客 {blog_name} 处理成功，获取到 {len(res_links)} 个链接")
            success_count += 1
        except Exception as e:
            print(f"博客 {blog_name} 处理失败: {e}")
            failed_blogs.append(f"{blog_name}: {e}")

    # 获取中文博客链接
    for blog_name in old_cn_blog_names:
        try:
            res_links = await fetch_old_blog_links_flow(blog_name, "cn", use_proxy=False)
            print(f"中文博客 {blog_name} 处理成功，获取到 {len(res_links)} 个链接")
            success_count += 1
        except Exception as e:
            print(f"中文博客 {blog_name} 处理失败: {e}")
            failed_blogs.append(f"cn/{blog_name}: {e}")

    # 获取英文博客链接
    for blog_name in old_en_blog_names:
        try:
            res_links = await fetch_old_blog_links_flow(blog_name, "en", use_proxy=True)
            print(f"英文博客 {blog_name} 处理成功，获取到 {len(res_links)} 个链接")
            success_count += 1
        except Exception as e:
            print(f"英文博客 {blog_name} 处理失败: {e}")
            failed_blogs.append(f"en/{blog_name}: {e}")

    # 输出总结
    total_blogs = len(blog_names) + len(old_cn_blog_names) + len(old_en_blog_names)
    print(f"\n=== 执行总结 ===")
    print(f"总共处理博客: {total_blogs}")
    print(f"成功处理: {success_count}")
    print(f"失败处理: {len(failed_blogs)}")
    
    if failed_blogs:
        print(f"\n失败的博客:")
        for failed in failed_blogs:
            print(f"  - {failed}")
    
    run_result = {
        "total": total_blogs,
        "success": success_count,
        "failed": len(failed_blogs),
        "failed_blogs": failed_blogs
    }
    if len(failed_blogs)>0:
        return Completed(name="CompletedWithFailed",message=json.dumps(run_result, ensure_ascii=False));
    else:
        return run_result;



if __name__ == "__main__":
    asyncio.run(fetch_all_blogs_links_flow())
    # 本地process部署
