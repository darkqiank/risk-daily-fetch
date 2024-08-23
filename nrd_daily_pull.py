import boto3
from datetime import datetime
import os
import requests
import json


s3_bucket = os.getenv('S3_BUCKET')
endpoint_url = os.getenv('S3_ENDPOINT')

s3 = boto3.client(
    service_name="s3",
    endpoint_url=endpoint_url
)


def save(json_data, path):
    s3.put_object(Bucket=s3_bucket, Key=path, Body=json_data)


token = os.getenv('NRD_TOKEN')

current_time = datetime.now()
formatted_cur_day = current_time.strftime('%Y-%m-%d')

res = requests.get(url=f'https://domains-monitor.com/api/v1/{token}/dailyupdate/json/')
data = json.dumps(res.json(), ensure_ascii=False, separators=(',', ':'))
filepath = f'risk/nrd/{formatted_cur_day}.json'
save(data, filepath)