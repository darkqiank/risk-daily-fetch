from .get_links import get_links
from .get_content import get_content
from .fetch_url import fetch_url, a_fetch_url

BASE_URL = 'https://www.trustwave.com/en-us/resources/blogs/spiderlabs-blog'
BASE_NETLOC = 'https://www.trustwave.com'

__all__ = ['get_links', 'get_content', 'fetch_url','a_fetch_url', 'BASE_URL']
