from curl_cffi import requests
import json
from x_parser import parse_user_timeline
import time
import os
import boto3
from datetime import datetime


with open('./cookie.json', 'r', encoding='utf-8') as file:
    cookie = json.load(file)


def xx(user_id, user_url):
    url = f"https://x.com/i/api/graphql/E3opETHurmVJflFsUBVuUQ/UserTweets?variables=%7B%22userId%22%3A%22{user_id}%22%2C%22count%22%3A20%2C%22includePromotedContent%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withVoice%22%3Atrue%2C%22withV2Timeline%22%3Atrue%7D&features=%7B%22rweb_tipjar_consumption_enabled%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22communities_web_enable_tweet_community_results_fetch%22%3Atrue%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22articles_preview_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Atrue%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22creator_subscriptions_quote_tweet_preview_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22rweb_video_timestamps_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D&fieldToggles=%7B%22withArticlePlainText%22%3Afalse%7D"

    payload = ""
    headers = cookie.get('headers')

    response = requests.request("GET", url, headers=headers, data=payload, impersonate="chrome124", timeout=30)
    if response.status_code == 200:
        # 将数据保存为JSON文件
        with open('data.json', 'w', encoding='utf-8') as file:
            json_str = json.dumps(response.json(), ensure_ascii=False, indent=4)
            file.write(json_str)
        return response.json()


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

# xx("3433210978", "https://x.com/JAMESWT_MHT")

with open('users.json', 'r', encoding='utf-8') as uf:
    users = json.load(uf)


current_time = datetime.now()
formatted_cur_day = current_time.strftime('%Y-%m-%d')
output_name = os.path.join('risk', 'twitter', f'{formatted_cur_day}.json')
output_datas = {}

for username in users:
    user = users.get(username)
    user_id = user.get('id')
    user_link = user.get('url')

    if not user.get('disable'):
        x_data_raw = xx(user_id, user_link)
        x_items = parse_user_timeline(x_data_raw)
        print(f'user {username} 爬取到 {len(x_items)} 条twitter！')
        for x_item in x_items:
            x_item['username'] = username
            x_item['user_id'] = user_id
            x_item['user_link'] = user_link
            output_datas[x_item['x_id']] = x_item
            # print(x_items)
        time.sleep(2)

# 保存数据
upload_to_s3(output_datas, output_name)