import sys
from pathlib import Path
import dotenv
import asyncio

dotenv.load_dotenv()

sys.path.append(str(Path(__file__).parent.parent))

from spider.base.url_extract_ioc_spider import UrlExtractIOCSpider

u_spider = UrlExtractIOCSpider()


async def main():
    _content = await u_spider.parse_content("blog_morphisec_com", 
                        "https://www.morphisec.com/blog/pay2key-resurgence-iranian-cyber-warfare/",
                        use_proxy=True)
    print(_content[0:20])

    ioc_list = await u_spider.submit_to_iocgpt(_content)
    print(ioc_list)

if __name__ == "__main__":
    asyncio.run(main())