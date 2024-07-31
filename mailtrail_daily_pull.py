import git
import os
import re
import ipaddress
import tldextract
import pandas as pd
from tqdm import tqdm

def is_url(input_str):
    return input_str.startswith('http://') or input_str.startswith('https://')

def is_ip_address(input_str):
    try:
        ipaddress.ip_address(input_str)
        return True
    except ValueError:
        return False


def is_domain(input_str):
    extracted = tldextract.extract(input_str)
    return bool(extracted.domain) and bool(extracted.suffix)


def is_ip_with_port(input_string):
    # 正则表达式匹配 IPv4 地址和端口号
    pattern = r'^(\d{1,3}\.){3}\d{1,3}:\d{1,5}$'
    if re.match(pattern, input_string):
        ip, port = input_string.split(':')
        if all(0 <= int(part) <= 255 for part in ip.split('.')) and 1 <= int(port) <= 65535:
            return True
    return False

def is_email(input_string):
    # 正则表达式匹配电子邮件地址
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(pattern, input_string) is not None

def categorize_input(input_str):
    if is_url(input_str):
        return 'url'
    elif is_ip_address(input_str):
        return "ip"
    elif is_ip_with_port(input_str):
        return "ipport"
    elif is_email(input_str):
        return "email"
    elif is_domain(input_str):
        return "domain"
    else:
        return "hash"

# 定义正则表达式来匹配路径
pattern = re.compile(r'trails/static/([^/]+)/([^/]+)')

# 设置仓库路径
repo_path = './maltrail'

# 打开仓库ss
if not os.path.exists(repo_path):
    repo = git.Repo.clone_from("https://github.com/stamparm/maltrail.git", repo_path)
else:
    repo = git.Repo(repo_path)
    repo.git.pull()

# 获取提交记录
commits = list(repo.iter_commits('master'))

print(len(commits))

# 设置每个文件的最大行数
max_rows_per_file = 100000  # 可以根据需要调整这个数值
# 最近1000个commits
max_commit_count = 1000
infos = []

i = 0
# 打印提交记录
for commit in tqdm(commits):
    if i > max_commit_count:
        break
    commit_date = commit.committed_datetime.strftime('%Y-%m-%d %H:%M:%S')
    # print(f'Commit: {commit.hexsha}')
    # print(f'Author: {commit.author.name} <{commit.author.email}>')
    # print(f'Date: {commit_date}')
    # print(f'Message: {commit.message}')
    # print('-' * 50)

    # 获取提交的父提交（对于第一个提交，父提交为空）
    parents = commit.parents
    if parents:
        parent = parents[0]
        # 获取提交与父提交的差异
        diffs = parent.diff(commit, create_patch=True)
        for diff in diffs:
            a_path = diff.a_path
            # print(a_path)
            if a_path:
                match = pattern.search(diff.a_path)
                if match:
                    target, t_file = match.groups()
                    ioc_org, _ = os.path.splitext(t_file)
                    # print(f'Matched path: {a_path}')
                    # print(f'Target: {target}, IOC_ORG: {ioc_org}')

                    lines = diff.diff.decode('utf-8').split('\n')
                    for line in lines:
                        if line.startswith('+') and not line.startswith('+++'):
                            # 去除两端的空白字符
                            s_line = f'{line[1:]}'.strip()
                            if not s_line.startswith('#') and s_line != '':
                                label = categorize_input(s_line)
                                info = {
                                    "commit_date":commit_date,
                                    "threaten": target,
                                    "ioc_org": ioc_org,
                                    "ioc_type": label,
                                    "ioc": s_line
                                }
                                # print(info)
                                infos.append(info)
    else:
        # 对于初始提交，没有父提交
        print('Initial commit, no diffs to show.')
    i += 1
    # break

# 计算需要多少个文件
df_infos = pd.DataFrame(infos)
num_files = (len(df_infos) // max_rows_per_file) + 1

# 分割并保存为多个 Excel 文件
for i in range(num_files):
    start_row = i * max_rows_per_file
    end_row = (i + 1) * max_rows_per_file
    split_df = df_infos.iloc[start_row:end_row]
    
    # 保存到 Excel 文件
    file_name = f"maltrail_iocs_part_{i+1}.xlsx"
    split_df.to_excel(file_name, index=False)
    print(f"Saved {file_name}")