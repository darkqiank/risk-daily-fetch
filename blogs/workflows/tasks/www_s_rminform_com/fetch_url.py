import requests
import os

API_KEY = os.getenv("BROWSERLESS_TOKEN", "").strip()
API_ENDPOINT = os.getenv("BROWSERLESS_URL", "").strip()


def fetch_url(url, headers=None, timeout=10, use_proxy=False):
    payload = {
        "url": url,
        "waitForTimeout": timeout,
    }
    try:
        response = requests.post(f'{API_ENDPOINT}/content?token={API_KEY}', json=payload, timeout=timeout)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"获取失败: {str(e)}")
        return None