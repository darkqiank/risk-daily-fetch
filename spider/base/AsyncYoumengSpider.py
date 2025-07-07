from typing import Dict, Any, List
import asyncio
import diskcache
import json
from curl_cffi import AsyncSession
import logging
from ..utils import hash_data


class AsyncYoumengSpider():
    """异步爬虫，抓取友盟内容数据"""

    base_url = "https://redqueen.tj-un.com/Json/information/informationList.json"

    payload='query=%7B%22page%22%3A1%2C%22page_count%22%3A20%2C%22keyword%22%3A%22%22%7D'
    headers = {
    'accept': 'application/json, text/plain, */*',
    'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
    'lang': 'zh',
    'origin': 'https://redqueen.tj-un.com',
    'priority': 'u=1, i',
    'referer': 'https://redqueen.tj-un.com/home/security',
    'sec-ch-ua': '"Microsoft Edge";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
    'sec-ch-ua-mobile': '?0',
    'sec-ch-ua-platform': '"macOS"',
    'sec-fetch-dest': 'empty',
    'sec-fetch-mode': 'cors',
    'sec-fetch-site': 'same-origin',
    'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0',
    'x-requested-with': 'XMLHttpRequest',
    'Cookie': 'weblanguage=zh; sid=f832b114-a44a-4d48-a516-56f20b50fddd; Hm_lvt_baa2cf6ea2ae38f45bacadd4f7679873=1733738555,1735010625; Hm_lpvt_baa2cf6ea2ae38f45bacadd4f7679873=1735010625; HMACCOUNT=40ACB0DF6E8F2B60',
    'content-type': 'application/x-www-form-urlencoded'
    }

    def __init__(self, logger: logging.Logger):
        self.logger = logger
    
    
    async def informationList(self) -> List[Dict[str, Any]]:
        try:
            session = AsyncSession()
            response = await session.post(self.base_url, headers=self.headers, data=self.payload)
            response.raise_for_status()
            datas = response.json().get("data", [])
            self.logger.info(f"爬取天际友盟数据成功: {len(datas)}")
            return datas
        except Exception as e:
            self.logger.error(f"爬取天际友盟数据失败: {e}")
            return []
        finally:
            await session.close()

    async def informationDetail(self, _id: str) :
        try:
            session = AsyncSession()
            response = await session.post("https://redqueen.tj-un.com/Json/information/informationDetail.json", 
                                        headers=self.headers, 
                                        data=f"query=%7B%22id%22%3A%22{_id}%22%7D")
            response.raise_for_status()
            return response.json().get("data")
        except Exception as e:
            self.logger.error(f"爬取天际友盟数据详情失败: {e}")
            return {}
        finally:
            await session.close()