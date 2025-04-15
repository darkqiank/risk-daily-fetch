from .get_links import get_links
from .get_content import get_content
from .fetch_url import fetch_url

BASE_URL = 'https://www.fortinet.com/jp/blog/threat-research'
BASE_NETLOC = 'https://www.fortinet.com'

__all__ = ['get_links', 'get_content', 'fetch_url', 'BASE_URL']
