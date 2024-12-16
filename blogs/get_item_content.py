from curl_cffi import requests
from gne import GeneralNewsExtractor
from readability import Document

def get_item_content(url):
    # 发送HTTP请求
    response = requests.get(url, impersonate="chrome", timeout=20)
    response.encoding = 'utf-8'  # 设置编码

    return response.content

extractor = GeneralNewsExtractor()


# content = get_item_content("https://www.anquanke.com/post/id/301033")
# url = "https://www.anquanke.com/post/id/301033"
# url = "https://www.rewterz.com/threat-advisory/bitter-apt-targeting-pakistan-active-iocs-37509"
# url = "https://www.rewterz.com/threat-advisory/agent-tesla-malware-active-iocs-37510"
url = "https://www.resecurity.com/blog/article/cybercriminals-impersonate-dubai-police-to-defraud-consumers-in-the-uae-smishing-triad-in-action"
content = get_item_content(url)
# print(content)
# result = extractor.extract(content.decode('utf-8'))

result = Document(content)
print(result.title())
print(result.summary())

# with open("test.html", "w", encoding="utf-8") as f:
#     f.write(result.summary())

# res2 = requests.post("http://127.0.0.1:3000/api/read", data={
#     "htmlContent": content.decode('utf-8')
# })
# print(res2.text)
