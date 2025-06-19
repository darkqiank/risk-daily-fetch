from readability import Document
from fast_readability import Readability
from bs4 import BeautifulSoup
import os
from curl_cffi import requests
import asyncio

# def parse_data_by_readability(data):
#     doc = Document(data)
#     # 获取文章的标题
#     title = doc.title()
#     summary_html = doc.summary()
#     soup = BeautifulSoup(summary_html, 'html.parser')
#     inner_text = soup.get_text(separator='\n')  # Using separator for better readability
#     return {
#         "title": title,
#         "pub_date": "",
#         "content": inner_text   
#     }

def parse_data_by_readability(data):
    try:
        reader = Readability()
        result = reader.extract_from_html(data)
        summary_html = result.get("content", "")
        soup = BeautifulSoup(summary_html, 'html.parser')
        inner_text = soup.get_text(separator='\n')  # Using separator for better readability
        return {
            "title": result.get("title", ""),
            "pub_date": "",
            "content": inner_text   
        }
    except Exception as e:
        print(f"获取失败: {str(e)} fallback 到readability")
        doc = Document(data)
        # 获取文章的标题
        title = doc.title()
        summary_html = doc.summary()
        soup = BeautifulSoup(summary_html, 'html.parser')
        inner_text = soup.get_text(separator='\n')  # Using separator for better readability
        return {
            "title": title,
            "pub_date": "",
            "content": inner_text   
        }


async def a_fetch_url(url, headers=None, timeout=20, use_proxy=False):
    proxy_url = os.getenv("PROXY_URL", "").strip()
    proxies = {"http": proxy_url, "https": proxy_url} if proxy_url and use_proxy else None
    print(f"{url}使用代理：", proxies)
    
    try:
        async with requests.AsyncSession() as session:
            response = await session.get(
                url, 
                headers=headers, 
                proxies=proxies, 
                impersonate="chrome", 
                timeout=timeout,
                stream=True,
                allow_redirects=True,
                verify=False
            )
            response.raise_for_status()  # 移除await，因为这不是异步方法
            response.encoding = 'utf-8'
            return await response.atext()
    except Exception as e:
        print(f"获取失败: {str(e)}")
        return None

def fetch_url(url, headers=None, timeout=20, use_proxy=False):
    return asyncio.run(a_fetch_url(url, headers, timeout, use_proxy))

def get_content(res):
    print("通用模块，开始解析")
    parsed_data = parse_data_by_readability(res)
    print("通用模块，解析完成 ")
    return parsed_data