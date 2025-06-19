import requests
import os


def extract_iocs(content: str):
    """
    阻塞式调用IOC提取服务，注意timeout设置较长
    """
    ioc_url = os.getenv("IOC_URL")
    api_key = os.getenv("IOC_API_KEY")
    res = requests.post(
        ioc_url,
        json={"messages": [{'role': 'user', 'content': content}]},
        headers={"Authorization": f"Bearer {api_key}"},
        timeout=7200  # 超时7200秒
    )
    return res.json()