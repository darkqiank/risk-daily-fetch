import hashlib
from datetime import datetime
import csv
import tldextract
import ipaddress
import os

domain_mapping_dict = {
    "未知": 0,
    "广告及弹出窗口": 1,
    "烟酒": 2,
    "匿名网站": 3,
    "艺术": 4,
    "商务": 5,
    "交通运输": 6,
    "聊天": 7,
    "C&C": 8,
    "C2": 8,
    "c2": 8,
    "cc_skimming": 8,
    "botnet_cc": 8,
    "论坛与新闻组": 9,
    "盗用网站": 10,
    "计算机与技术": 11,
    "犯罪活动": 12,
    "交友": 13,
    "下载网站": 14,
    "教育": 15,
    "娱乐": 16,
    "金融": 17,
    "赌博": 18,
    "游戏": 19,
    "政府": 20,
    "仇恨与偏执": 21,
    "健康与医药": 22,
    "非法药物": 23,
    "找工作": 24,
    "流媒体与下载": 26,
    "新闻": 27,
    "非盈利组织与 NGO": 28,
    "裸体": 29,
    "个人网站": 30,
    "钓鱼与欺诈": 31,
    "钓鱼": 31,
    "Phishing": 31,
    "政策": 32,
    "色情/性暴露": 33,
    "色情": 33,
    "房地产": 34,
    "宗教": 35,
    "餐饮": 36,
    "搜索引擎与门户网站": 37,
    "购物": 38,
    "社交网络": 39,
    "垃圾邮件网站": 40,
    "垃圾邮件": 40,
    "体育": 41,
    "恶意软件": 42,
    "Malware": 42,
    "payload_delivery": 42,
    "翻译": 44,
    "旅行": 45,
    "暴力": 46,
    "武器": 47,
    "Web 邮件": 48,
    "普通": 49,
    "休闲与消遣": 50,
    "僵尸网络": 61,
    "邪教": 62,
    "时尚与美容": 63,
    "贺卡": 64,
    "黑客": 65,
    "非法软件": 67,
    "图像共享": 68,
    "信息安全": 69,
    "即时通信": 70,
    "网络错误": 71,
    "绑定域名": 72,
    "点对点": 73,
    "专用IP地址": 74,
    "作弊": 75,
    "性教育": 76,
    "粗俗": 77,
    "虐童图像": 78,
    "恶意": 79,
    "疑似恶意": 80,
    "挂马": 81,
    "DGA域名": 82,
    "木马": 83,
    "勒索软件": 84,
    "网络蠕虫": 85,
    "病毒": 86,
    "APT": 87,
    "撞库": 88,
    "漏洞利用": 89,
    "搜索引擎公司爬虫": 90,
    "失陷主机": 91,
    "记录数据": 92,
    "扫描源": 93,
    "P2P节点": 94,
    "DNS": 95,
    "基础信息": 96,
    "IDC服务器": 97,
    "动态IP": 98,
    "保留地址": 99,
    "未启用IP": 100,
    "HTTP代理": 101,
    "HTTP代理入口": 102,
    "HTTP代理出口": 103,
    "Socks代理入口": 104,
    "Socks代理出口": 105,
    "CDN服务器": 106,
    "VPN": 107,
    "VPN入口": 108,
    "VPN出口": 109,
    "Tor": 110,
    "Tor入口": 111,
    "Tor出口": 112,
    "网关": 113,
    "安全机构接管C2": 114,
    "动态域名": 115,
    "SSH暴力破解": 116,
    "FTP暴力破解": 117,
    "SMTP暴力破解": 118,
    "手机网络": 119,
    "Socks代理": 120,
    "挖矿": 121,
    "隐蔽信道": 122,
    "恐怖主义": 123,
    "黑产团伙": 124,
    "黑客工具": 125,
    "恶意DNS服务器": 126,
    "劫持": 127,
    "基础信息": 128,
    "BT服务器": 129,
    "CDN域名": 130,
    "CNAME域名": 131,
    "2021你懂的": 132,
    "暴力破解": 135,
    "2022你懂的": 136,
    "网络诈骗": 137,
    "白名单": 138,
    "窃密": 139,
    "2023你懂的": 140,
    "流氓软件": 141,
    "非法内容": 142,
    "仿冒网站": 143,
    "2024你懂的": 144
}

ip_mapping_dict = {
    "恶意": 0,
    "DDoS 攻击": 1,
    "漏洞攻击": 2,
    "垃圾邮件": 3,
    "Web攻击": 4,
    "扫描源": 5,
    "Botnet 客户端": 6,
    "僵尸网络": 6,
    "恶意软件": 7,
    "Malware": 7,
    "钓鱼": 8,
    "钓鱼与欺诈": 8,
    "代理": 9,
    "C&C": 10,
    "C2": 10,
    "c2": 10,
    "cc_skimming": 10,
    "botnet_cc": 10,
    "其他": 11,
    "疑似恶意": 12,
    "bruteforce": 13,
    "撞库攻击": 14,
    "机器攻击": 15,
    "短信轰炸": 16,
    "薅羊毛": 17,
    "tor": 18,
    "劫持": 19,
    "搜索引擎公司爬虫": 20,
    "失陷主机": 21,
    "P2P节点": 22,
    "IDC服务器": 23,
    "动态IP": 24,
    "网关及基站": 25,
    "保留地址": 26,
    "未启用IP": 27,
    "HTTP代理入口": 28,
    "HTTP代理出口": 29,
    "Socks代理入口": 30,
    "Socks代理出口": 31,
    "VPN": 32,
    "VPN入口": 33,
    "VPN出口": 34,
    "白名单": 35,
    "赌博": 36,
    "色情": 37,
    "勒索软件": 38,
    "木马": 39,
    "APT": 40,
    "记录数据": 41,
    "基础信息": 43,
    "CDN服务器": 44,
    "Tor入口": 45,
    "Tor出口": 46,
    "教育": 47,
    "安全机构接管C2": 48,
    "SSH暴力破解": 49,
    "FTP暴力破解": 50,
    "手机网络": 51,
    "Socks代理": 52,
    "挖矿": 54,
    "未知": 55,
    "木马下载器": 56,
    "网络蠕虫": 57,
    "DNS劫持": 58,
    "DNS服务器": 59,
    "协议攻击": 60,
    "黑客工具攻击": 61,
    "爬虫": 62,
    "恶意DNS服务器": 63,
    "HTTP AUTH 暴力破解": 64,
    "SMTP 暴力破解": 65,
    "HTTP Proxy": 66,
    "BT服务器": 67,
    "骨干网": 68,
    "病毒": 69,
    "疑似护网攻击": 70,
    "2021你懂的": 71,
    "矿池傀儡机": 72,
    "挖矿傀儡机": 72,
    "2024你懂的": 78,
    "窃密": 76
}

url_mapping_dict = {
    "Unknown": 0,
    "Malware": 1,
    "恶意软件下载": 1,
    "payload_delivery": 1,
    "Mining": 2,
    "挖矿": 2,
    "公开对外提供挖矿类矿池": 2,
    "Web Attacks": 3,
    "WEB攻击": 3,
    "web攻击的url": 3,
    "C&C": 4,
    "C2": 4,
    "botnet_cc": 4,
    "c2": 4,
    "远控": 4,
    "Phishing & Fraud": 5,
    "钓鱼与欺诈": 5,
    "钓鱼": 5,
    "porn": 6,
    "色情": 6,
    "gambling": 7,
    "赌博": 7,
    "Illegal Drug": 8,
    "违禁": 8
}

# 获取当前文件（utils.py）所在的目录路径
current_dir = os.path.dirname(os.path.abspath(__file__))
    
# 本地文件路径
local_suffix_list_path = os.path.join(current_dir, "public_suffix_list.dat")
file_url = f"file://{local_suffix_list_path}"

# 初始化TLDExtract，指定本地文件和缓存
extract = tldextract.TLDExtract(
    suffix_list_urls=[file_url],  # 使用本地文件
)


def convert_to_timestamp(date_string):
    try:
        # 定义日期格式
        date_format = "%Y-%m-%d"
        # 将日期字符串转换为 datetime 对象
        dt_obj = datetime.strptime(date_string, date_format)
        # 将 datetime 对象转换为时间戳
        timestamp = int(dt_obj.timestamp())
        return timestamp
    except Exception as e:
        print(f"Error converting date string to timestamp: {e}")
        # 返回当前时间戳
        return int(datetime.now().timestamp())


def hash_text(text: str) -> str:
    # 使用 SHA-256 哈希算法
    hash_object = hashlib.sha256()

    # 更新哈希对象，确保支持处理长文本
    hash_object.update(text.encode('utf-8'))

    # 返回十六进制的哈希值
    return hash_object.hexdigest()


def create_group_mapping(file_path):
    """
    Create a mapping dictionary from a TSV file, where aliases and APTs
    map to the corresponding APT value. The keys are cleaned by removing
    spaces and converting to lowercase, while the values (APT) remain unchanged.

    :param file_path: str, path to the TSV file
    :return: dict, mapping of cleaned aliases and APTs to original APT
    """
    # Initialize an empty dictionary for the mapping
    full_name_mapping = {}

    # Function to clean the key by removing all spaces and converting to lowercase
    def clean_key(key):
        return key.replace(' ', '').lower()

    # Open the TSV file and read it line by line
    with open(file_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file, delimiter='\t')

        # Iterate over each row in the file
        for row in reader:
            apt = row.get('apt', '').strip()
            alias_field = row.get('alias', '')

            # Split the alias field by commas if it's not empty
            aliases = alias_field.split(',') if alias_field else []

            # Map each alias to the apt after cleaning the key
            for alias in aliases:
                cleaned_alias = clean_key(alias)
                if cleaned_alias:
                    full_name_mapping[cleaned_alias] = apt

            # Map the apt to itself with cleaned key
            if apt:
                full_name_mapping[clean_key(apt)] = apt

    return full_name_mapping


def create_family_mapping(file_path):
    """
    Create a mapping dictionary from a TSV file, where aliases and family
    map to the corresponding family value. The keys are cleaned by removing
    spaces and converting to lowercase, while the values (family) remain unchanged.

    :param file_path: str, path to the TSV file
    :return: dict, mapping of cleaned aliases and family to original family
    """
    # Initialize an empty dictionary for the mapping
    full_name_mapping = {}

    # Function to clean the key by removing all spaces and converting to lowercase
    def clean_key(key):
        return key.replace(' ', '').lower()

    # Open the TSV file and read it line by line
    with open(file_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file, delimiter='\t')

        # Iterate over each row in the file
        for row in reader:
            family = row.get('family', '').strip()
            alias_field = row.get('alias', '')

            # Split the alias field by commas if it's not empty
            aliases = alias_field.split(',') if alias_field else []

            # Map each alias to the family after cleaning the key
            for alias in aliases:
                cleaned_alias = clean_key(alias)
                if cleaned_alias:
                    full_name_mapping[cleaned_alias] = family

            # Map the family to itself with cleaned key
            if family:
                full_name_mapping[clean_key(family)] = family

    return full_name_mapping


def create_alexa_mapping(file_path):
    # 创建alexa白名单数据
    alexa_mapping = {}
    with open(file_path, 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file, delimiter=',')

        # Iterate over each row in the file
        for row in reader:
            domain = row.get("Domain", '').strip()
            global_rank = row.get("GlobalRank", -1)
            alexa_mapping[domain] = global_rank
    return alexa_mapping

def check_and_extract_domain(domain):
    """
    判断域名是否有效，并提取主域名。
    
    参数:
        domain (str): 要检查的域名。
    
    返回:
        tuple: (is_valid, main_domain)
            - is_valid (bool): 域名是否有效。
            - main_domain (str): 主域名（如果有效），否则为 None。
    """
    extracted = extract(domain)
    # 判断域名是否有效
    is_valid = bool(extracted.domain) and bool(extracted.suffix)
    # 提取主域名
    main_domain = f"{extracted.domain}.{extracted.suffix}" if is_valid else None
    return is_valid, main_domain


def is_public_ip(ip):
    """
    判断 IP 地址是否为公网 IP 地址。
    
    参数:
        ip (str): 要检查的 IP 地址。
    
    返回:
        bool: 如果是公网 IP 地址，返回 True；否则返回 False。
    """
    try:
        ip_obj = ipaddress.ip_address(ip)
    except ValueError:
        # 如果 IP 地址格式无效，直接返回 False
        return False
    
    # 检查是否为私有 IP 地址或保留 IP 地址
    if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local or ip_obj.is_unspecified:
        return False
    return True

if __name__ == '__main__':
    print(hash_text("asdfasfasdasd"))

    # 示例用法
    date_string = "2023-12-08"
    timestamp = convert_to_timestamp(date_string)
    print(f"The timestamp for {date_string} is {timestamp}.")
