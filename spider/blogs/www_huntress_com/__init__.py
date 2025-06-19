from .get_links import get_links
from .get_content import get_content
from .fetch_url import fetch_url, a_fetch_url

BASE_URL = 'https://www.huntress.com/blog'
BASE_NETLOC = 'https://www.huntress.com'

__all__ = ['get_links', 'get_content', 'fetch_url','a_fetch_url', 'BASE_URL']
