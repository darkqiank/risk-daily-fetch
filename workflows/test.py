import sys
from pathlib import Path
import dotenv
import asyncio
import os

sys.path.append(str(Path(__file__).parent.parent))
dotenv.load_dotenv()
print(os.getenv("LLM_READ_URL"))

from spider.base.url_extract_ioc_spider import UrlExtractIOCSpider

u_spider = UrlExtractIOCSpider()


async def main():
    _content = await u_spider.parse_content("测试", 
                        # "https://medium.com/@rst_cloud/rst-ti-report-digest-07-jul-2025-5fa3bfd90684",
                        "https://1275.ru/ioc/novyy-voip-botnet-atakuet-marshrutizatory-ispolzuya-standartnye-paroli_13451",
                        use_proxy=True)
    print(_content[0:20])

    # ioc_list = await u_spider.submit_to_iocgpt(_content)
    read_res = await u_spider.llm_read(_content)
    print(read_res)

if __name__ == "__main__":
    asyncio.run(main())