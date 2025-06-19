from typing import Dict, Any, List
import asyncio
import diskcache
import json
from curl_cffi import AsyncSession
from ..utils import hash_data


class AsyncYoumengSpider():
    """异步爬虫，抓取友盟内容数据"""
    # 博客爬取缓存
    ym_cache = diskcache.Cache('cache/ym_cache')

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
    
    async def parse(self, **kwargs) -> List[Dict[str, Any]]:
        """异步爬取数据并解析"""
        # 获取API参数
        params = self.config.get("params", {})
        
        # 添加用户传入的参数
        params.update(kwargs)

        use_cache = params.get('use_cache', True)

        ym_list = []
        # 直接实例化 AsyncSession，不使用 with 语句
        session = AsyncSession()
        try:
            response = await session.post(self.base_url, headers=self.headers, data=self.payload)
            response.raise_for_status()
            datas = response.json().get("data", [])
            for data in datas:
                self.logger.info(data)
                _id = data.get("id")
                if self.ym_cache.get(_id) and use_cache:
                    self.logger.info(f"已缓存 {_id} 的内容")
                    ym_list.append(json.loads(self.ym_cache.get(_id)))
                    continue
                try:
                    new_res = await session.post("https://redqueen.tj-un.com/Json/information/informationDetail.json", 
                                                headers=self.headers, 
                                                data=f"query=%7B%22id%22%3A%22{_id}%22%7D")
                    detail = new_res.json().get("data")
                except Exception as e:
                    print(e)
                    detail = data

                url_text = f'{detail.get("title")} {detail.get("description")}'
                item = {"url": detail.get("refInfo") or detail.get("id"), 
                        "source": "天际友盟",
                        "sourceType": "blog",                   
                        "content": url_text,
                        "contentHash": hash_data(url_text),
                }
                ym_list.append(item)
                self.logger.info(f"缓存 {_id} 的内容")
                self.ym_cache.set(_id, json.dumps(item, ensure_ascii=False), expire=3600*24)
                await asyncio.sleep(2)
        finally:
            # 确保会话被关闭
            await session.close()
        return ym_list               
                
    
    async def save(self, data: List[Any]) -> bool:
        """异步保存数据"""
        return True