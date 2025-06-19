from .get_links import get_links
from .get_content import get_content
from .fetch_url import fetch_url, a_fetch_url

BASE_URL = 'https://blog.sucuri.net/'
BASE_NETLOC = 'https://blog.sucuri.net'

__all__ = ['get_links', 'get_content', 'fetch_url','a_fetch_url', 'BASE_URL']
