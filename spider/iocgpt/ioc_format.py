import os
import sys
from datetime import datetime

# 添加外部模块路径
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from .utils import domain_mapping_dict, ip_mapping_dict, url_mapping_dict
from .utils import convert_to_timestamp, create_group_mapping, create_family_mapping, create_alexa_mapping, check_and_extract_domain, is_public_ip

current_dir = os.path.dirname(__file__)
group_mapping = create_group_mapping(os.path.join(current_dir, "apt_info_20241028.csv"))
family_mapping = create_family_mapping(os.path.join(current_dir, "family_info_20241028.csv"))
alexa_mapping = create_alexa_mapping(os.path.join(current_dir, "majestic_million_202504.csv"))

def clean_key(key):
    if key is None:
        return None
    return key.replace(" ", "").lower()

def standardize_iocs(iocs, url):
    """ IOC 标准化处理逻辑 """
    standardized = []
    for ioc in iocs.get('iocs', []):
        el = {}
        group = ioc.get('组织')
        family = ioc.get('家族')
        cleaned_group = clean_key(group)
        cleaned_family = clean_key(family)
        if (cleaned_group and cleaned_group not in family_mapping and cleaned_group not in group_mapping) or \
           (cleaned_family and cleaned_family not in group_mapping and cleaned_family not in family_mapping):
            el["send2kafka"] = False
        else:
            el["send2kafka"] = True

        if cleaned_group in family_mapping:
            family = family_mapping[cleaned_group]
            ioc['家族'] = family
            ioc['组织'] = ""
        if cleaned_family in group_mapping:
            group = group_mapping[cleaned_family]
            ioc['组织'] = group
            ioc['家族'] = ""

        if ioc.get('类型') == 'IP':
            if not is_public_ip(ioc['IOC']):
                continue
            el["ip"] = ioc['IOC']
            threaten_type = ip_mapping_dict.get(ioc.get('威胁类型'), ioc.get('威胁类型'))
            if threaten_type:
                el["threaten_type"] = threaten_type
            el["credit_level"] = "5"
            attack_time = convert_to_timestamp(ioc.get('攻击时间'))
            if attack_time:
                el["attack_time"] = attack_time
            el["threaten_source"] = "90"
            el["source"] = 112

            evidence = {}
            port = ioc.get("端口")
            if port:
                evidence["port"] = port
            if url:
                evidence["references"] = url
            if evidence:
                el["evidence"] = evidence

            tags = {}
            virus_family = ioc.get("家族", "")
            if virus_family:
                tags["virus_family"] = [virus_family]
            gangs = ioc.get("组织", "")
            if gangs:
                tags["gangs"] = [gangs]
            if tags:
                el["tags"] = tags

        elif ioc.get('类型') == "Domain":
            is_valid, main_domain = check_and_extract_domain(str(ioc['IOC']))
            if not is_valid or main_domain in alexa_mapping:
                continue
            el["domain"] = ioc['IOC']
            threaten_type = domain_mapping_dict.get(ioc.get('威胁类型'), ioc.get('威胁类型'))
            if threaten_type:
                el["threaten_type"] = threaten_type
            el["credit_level"] = "5"
            attack_time = convert_to_timestamp(ioc.get('攻击时间'))
            if attack_time:
                el["attack_time"] = attack_time
            el["threaten_source"] = "90"
            el["source"] = 112

            evidence = {}
            port = ioc.get("端口")
            if port:
                evidence["port"] = port
            if url:
                evidence["references"] = url
            if evidence:
                el["evidence"] = evidence

            tags = {}
            virus_family = ioc.get("家族", "")
            if virus_family:
                tags["virus_family"] = [virus_family]
            gangs = ioc.get("组织", "")
            if gangs:
                tags["gangs"] = [gangs]
            if tags:
                el["tags"] = tags

        elif ioc.get("类型") == "URL":
            el["url"] = ioc['IOC']
            threaten_type = domain_mapping_dict.get(ioc.get('威胁类型'), ioc.get('威胁类型'))
            if threaten_type:
                el["threaten_type"] = threaten_type
            el["credit_level"] = "5"
            attack_time = convert_to_timestamp(ioc.get('攻击时间'))
            if attack_time:
                el["attack_time"] = attack_time
            el["is_online"] = True
            el["is_valid"] = True
            el["threaten_type"] = 1
            el["source"] = 112

        else:
            el["data_type"] = "file"
            el["level"] = "HIGH"
            threaten_type = ioc.get('威胁类型')
            if threaten_type:
                el["threaten_type"] = threaten_type

            event_tag = []
            event = {"modified": datetime.now().strftime("%Y-%m-%d %H:%M:%S")}
            if url:
                event["reference"] = url
            event_tag.append(event)
            el["event_tag"] = event_tag
            el["source"] = ["112"]

            family = ioc.get("家族")
            if family:
                el["family"] = [family]

            if ioc.get("类型") == "SHA256":
                el["sha256"] = ioc['IOC']
            elif ioc.get("类型") == "SHA128":
                el["sha128"] = ioc['IOC']
            elif ioc.get("类型") == "SHA1":
                el["sha1"] = ioc['IOC']
            elif ioc.get("类型") == "MD5":
                el["md5"] = ioc['IOC']
            else:
                el["hash"] = ioc['IOC']
        standardized.append(el)
    return standardized


# iocs = {'data': {'iocs': [{'IOC': '152.53.131.80', '端口': '8080', '类型': 'IP', '威胁等级': '', '威胁类型': 'C&C', '组织': '', '家族': '', '攻击时间': '', '发表时间': ''}], 'APT': '否', '欧美': '是'}}
iocs = {'iocs': [{'IOC': '111.229.202.115', '端口': '443', '类型': 'IP', '威胁等级': '高', '威胁类型': 'C&C', '组织': '', '家族': 'Havoc', '攻击时间': '', '发表时间': ''}], 'APT': '否', '欧美': '否'}
url = "dsjiwjfeiwujceijcfeijdeicjfreic"

s_iocs = standardize_iocs(iocs, url)
print(s_iocs)