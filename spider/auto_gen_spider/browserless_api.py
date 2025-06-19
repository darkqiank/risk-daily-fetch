import requests
import os
from fetch_utils import compress_html

API_KEY = os.getenv("BROWSERLESS_TOKEN", "").strip()
API_ENDPOINT = os.getenv("BROWSERLESS_URL", "").strip()

url = "https://www.s-rminform.com/latest-thinking/ransomware-in-focus-meet-nightspire"

def fetch_url(url, headers=None, timeout=10):
    payload = {
        "url": url,
        "waitForTimeout": 20,
    }
    try:
        response = requests.post(f'{API_ENDPOINT}/content?token={API_KEY}', json=payload, timeout=timeout)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"获取失败: {str(e)}")
        return None

res = fetch_url(url)
c_res = compress_html(res)
print(c_res)