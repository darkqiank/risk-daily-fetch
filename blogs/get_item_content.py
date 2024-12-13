from curl_cffi import requests

def get_item_content(url):
    # 发送HTTP请求
    response = requests.get(url, impersonate="chrome", timeout=20)
    response.encoding = 'utf-8'  # 设置编码

    with open("test.html", "wb") as f:
        f.write(response.content)


get_item_content("https://www.anquanke.com/post/id/301033")