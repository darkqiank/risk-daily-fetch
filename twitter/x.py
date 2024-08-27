from curl_cffi import requests
import json


def xx(user_id, user_url):
    url = f"https://x.com/i/api/graphql/E3opETHurmVJflFsUBVuUQ/UserTweets?variables=%7B%22userId%22%3A%22{user_id}%22%2C%22count%22%3A20%2C%22includePromotedContent%22%3Atrue%2C%22withQuickPromoteEligibilityTweetFields%22%3Atrue%2C%22withVoice%22%3Atrue%2C%22withV2Timeline%22%3Atrue%7D&features=%7B%22rweb_tipjar_consumption_enabled%22%3Atrue%2C%22responsive_web_graphql_exclude_directive_enabled%22%3Atrue%2C%22verified_phone_label_enabled%22%3Afalse%2C%22creator_subscriptions_tweet_preview_api_enabled%22%3Atrue%2C%22responsive_web_graphql_timeline_navigation_enabled%22%3Atrue%2C%22responsive_web_graphql_skip_user_profile_image_extensions_enabled%22%3Afalse%2C%22communities_web_enable_tweet_community_results_fetch%22%3Atrue%2C%22c9s_tweet_anatomy_moderator_badge_enabled%22%3Atrue%2C%22articles_preview_enabled%22%3Atrue%2C%22responsive_web_edit_tweet_api_enabled%22%3Atrue%2C%22graphql_is_translatable_rweb_tweet_is_translatable_enabled%22%3Atrue%2C%22view_counts_everywhere_api_enabled%22%3Atrue%2C%22longform_notetweets_consumption_enabled%22%3Atrue%2C%22responsive_web_twitter_article_tweet_consumption_enabled%22%3Atrue%2C%22tweet_awards_web_tipping_enabled%22%3Afalse%2C%22creator_subscriptions_quote_tweet_preview_enabled%22%3Afalse%2C%22freedom_of_speech_not_reach_fetch_enabled%22%3Atrue%2C%22standardized_nudges_misinfo%22%3Atrue%2C%22tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled%22%3Atrue%2C%22rweb_video_timestamps_enabled%22%3Atrue%2C%22longform_notetweets_rich_text_read_enabled%22%3Atrue%2C%22longform_notetweets_inline_media_enabled%22%3Atrue%2C%22responsive_web_enhance_cards_enabled%22%3Afalse%7D&fieldToggles=%7B%22withArticlePlainText%22%3Afalse%7D"

    payload = ""
    headers = {
       'accept': '*/*',
       'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
       'authorization': 'Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA',
       'priority': 'u=1, i',
       'referer': user_url,
       'sec-ch-ua': '"Chromium";v="128", "Not;A=Brand";v="24", "Microsoft Edge";v="128"',
       'sec-ch-ua-mobile': '?0',
       'sec-ch-ua-platform': '"macOS"',
       'sec-fetch-dest': 'empty',
       'sec-fetch-mode': 'cors',
       'sec-fetch-site': 'same-origin',
       'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36 Edg/128.0.0.0',
       'x-client-transaction-id': 'oZtUPpgkhBTDDz3keg6QTaA/cc+9t+2LNjpo1NwsE5esXbSEelf4WSJxUjp2L0nj7d9D3aOzCAMhpzj4ihncPozHMgtTog',
       'x-client-uuid': 'ec4c6117-c52d-42c0-afdb-5326417fde55',
       'x-csrf-token': '2f841ae92245857acb7a9e1a0319a50f772e5b2339becb9c49ed1f7ce4349654c63aca61137f85c5f0ccfa3eccb3df9f21bcf8544b0964f3af2640c4cab5217def2d0a9e36dccb3db7820a1bd4a28791',
       'x-twitter-active-user': 'yes',
       'x-twitter-auth-type': 'OAuth2Session',
       'x-twitter-client-language': 'zh-cn',
       'Cookie': 'lang=zh-cn; auth_token=23eeb6783439170901b45fdce6382039f0921c1f; ct0=2f841ae92245857acb7a9e1a0319a50f772e5b2339becb9c49ed1f7ce4349654c63aca61137f85c5f0ccfa3eccb3df9f21bcf8544b0964f3af2640c4cab5217def2d0a9e36dccb3db7820a1bd4a28791; twid=u%3D1338452526; des_opt_in=Y; _ga=GA1.2.1222369251.1724312546; lang=zh-cn; personalization_id="v1_TSbGiy/UicSMfSskS3X/+A; personalization_id="v1_hcLt2PrxOYygATy/UkSFJA=="',
       'content-type': 'application/json',
       'Host': 'x.com',
       'Connection': 'keep-alive'
    }

    response = requests.request("GET", url, headers=headers, data=payload, impersonate="chrome124")
    if response.status_code == 200:
        # 将数据保存为JSON文件
        with open('data.json', 'w', encoding='utf-8') as file:
            json_str = json.dumps(response.json(), ensure_ascii=False, indent=4)
            file.write(json_str)


xx("3433210978", "https://x.com/JAMESWT_MHT")