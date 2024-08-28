import os
import importlib.util
import json
import boto3
from datetime import datetime
import argparse
import time


# 动态导入模块并调用get_links函数
def call_get_links(script_path, retries=3, delay=2):
    for attempt in range(retries):
        try:
            module_name = os.path.splitext(os.path.basename(script_path))[0]
            spec = importlib.util.spec_from_file_location(module_name, script_path)
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)

            # 调用get_links函数
            if hasattr(module, 'get_links'):
                links = module.get_links()
                return links
            else:
                return []
        except Exception as e:
            print(f"Error in {script_path} (attempt {attempt + 1}): {str(e)}")
            time.sleep(delay)
    return []


# 批量调用get_links
def collect_links(directory, specific_script=None):
    all_links = {}
    stats = {}
    if specific_script:
        for file in specific_script.split(','):
            if file.endswith('.py'):
                script_path = os.path.join(directory, file)
                key = os.path.splitext(file)[0]
            else:
                script_path = os.path.join(directory, file, '.py')
                key = file
            links = call_get_links(script_path)
            stats[key] = len(links)
            all_links[key] = links
    else:
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith('.py') and file != '__init__.py':
                    script_path = os.path.join(root, file)
                    links = call_get_links(script_path)
                    # Remove the .py suffix from the key
                    key = os.path.splitext(file)[0]
                    stats[key] = len(links)
                    all_links[key] = links
    print(f'爬取数据统计：{stats}')
    return all_links


# 上传JSON到S3
def upload_to_s3(data, s3_file_name):
    s3_bucket = os.getenv('S3_BUCKET')
    endpoint_url = os.getenv('S3_ENDPOINT')

    s3 = boto3.client(
        service_name="s3",
        endpoint_url=endpoint_url
    )

    # 检查是否存在同名文件
    try:
        existing_object = s3.get_object(Bucket=s3_bucket, Key=s3_file_name)
        existing_data = json.loads(existing_object['Body'].read().decode('utf-8'))
        # 合并数据
        for key, value in data.items():
            existing_data[key] = value
        merged_data = existing_data
    except s3.exceptions.NoSuchKey:
        # 如果文件不存在，使用新的数据
        merged_data = data

    json_data = json.dumps(merged_data, ensure_ascii=False, indent=4)
    s3.put_object(Bucket=s3_bucket, Key=s3_file_name, Body=json_data.encode('utf-8'))
    print(f"All links have been uploaded to s3://{s3_bucket}/{s3_file_name}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Collect links from Python scripts and upload to S3.')
    parser.add_argument('spider_dir', type=str, help='Directory containing the spider scripts')
    parser.add_argument('-s', '--script', type=str, help='Specific script to run，用逗号分割多个', default=None)
    args = parser.parse_args()

    current_time = datetime.now()
    formatted_cur_day = current_time.strftime('%Y-%m-%d')
    output_name = os.path.join('risk', 'blogs', args.spider_dir, f'{formatted_cur_day}.json')
    all_links = collect_links(args.spider_dir, args.script)
    upload_to_s3(all_links, output_name)

