from .get_links import get_links
from .get_content import get_content
from .fetch_url import fetch_url, a_fetch_url

BASE_URL = 'https://cyble.com/blog/?ucfrontajaxaction=getfiltersdata&layoutid=29234&elid=a3b899f&addelids=28aebe7'
BASE_NETLOC = 'https://cyble.com'

__all__ = ['get_links', 'get_content', 'fetch_url','a_fetch_url', 'BASE_URL']
