import os
import importlib.util
import json
import sys
import boto3
from datetime import datetime


# 动态导入模块并调用get_links函数
def call_get_links(script_path):
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
        print(f"Error in {script_path}: {str(e)}")
        return []


# 批量调用get_links
def collect_links(directory):
    all_links = {}
    for root, _, files in os.walk(directory):
        for file in files:
            if file.endswith('.py') and file != '__init__.py':
                script_path = os.path.join(root, file)
                links = call_get_links(script_path)
                # Remove the .py suffix from the key
                key = os.path.splitext(file)[0]
                all_links[key] = links
    return all_links


# 上传JSON到S3
def upload_to_s3(data, s3_file_name):
    s3_bucket = os.getenv('S3_BUCKET')
    endpoint_url = os.getenv('S3_ENDPOINT')

    s3 = boto3.client(
        service_name="s3",
        endpoint_url=endpoint_url
    )
    json_data = json.dumps(data, ensure_ascii=False, indent=4)
    s3.put_object(Bucket=s3_bucket, Key=s3_file_name, Body=json_data.encode('utf-8'))
    print(f"All links have been uploaded to s3://{s3_bucket}/{s3_file_name}")


if __name__ == '__main__':
    if len(sys.argv) != 2:
        print("Usage: python script.py <spider_dir>")
    else:
        spider_dir = sys.argv[1]

        current_time = datetime.now()
        formatted_cur_day = current_time.strftime('%Y-%m-%d')
        output_name = os.path.join('risk', 'blogs', spider_dir, f'{formatted_cur_day}.json')
        all_links = collect_links(spider_dir)
        upload_to_s3(all_links, output_name)

