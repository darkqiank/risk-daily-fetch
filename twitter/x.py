from DrissionPage import ChromiumPage, ChromiumOptions

co = ChromiumOptions()
co.set_proxy('http://127.0.0.1:10808')

# 创建页面对象，并启动或接管浏览器
page = ChromiumPage(co)
# 跳转到登录页面
page.get('https://x.com/reddrip7')
