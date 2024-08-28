import json


def parse_user_timeline(data):
    x_items = []
    timelines = data.get("data").get("user").get("result").get("timeline_v2").get("timeline")
    instructions = timelines.get("instructions")
    for instruction in instructions:
        _type = instruction.get("type")
        if _type == "TimelineAddEntries":
            entries = instruction.get("entries")
            for entry in entries:
                entryId = entry.get("entryId")
                content = entry.get("content")
                if content.get("entryType") == "TimelineTimelineItem":
                    itemContent = content.get("itemContent")
                    x_item = parse_timeline_tweet_item(entryId, itemContent)
                    # print(x_item)
                    x_items.append(x_item)
                elif content.get("entryType") == "TimelineTimelineModule":
                    x_item = {'x_id': entryId, 'itemType': "TimelineTimelineModule", 'data': []}
                    for item in content.get("items"):
                        _entryId = item.get("entryId")
                        _itemContent = item.get("item").get("itemContent")
                        x_item['data'].append(parse_timeline_tweet_item(_entryId, _itemContent))
                    # print(x_item)
                    x_items.append(x_item)
    return x_items


def parse_timeline_tweet_item(entryId, itemContent):
    itemType = itemContent.get('itemType')
    x_item = {}
    x_item['x_id'] = entryId
    x_item['itemType'] = itemType
    if itemType == "TimelineTweet":
        tweet_results = itemContent.get("tweet_results").get("result")
        legacy = tweet_results.get('legacy')
        x_data = {}
        x_data['created_at'] = legacy.get('created_at')
        x_data['bookmark_count'] = legacy.get('bookmark_count')
        x_data['favorite_count'] = legacy.get('favorite_count')
        full_text = legacy.get('full_text')
        x_data['full_text'] = full_text

        # 添加外链和多媒体内容解析
        x_urls = {}
        x_medias = {}

        entities = legacy.get('entities')
        if entities:
            e_urls = entities.get("urls")
            if e_urls:
                for e_url in e_urls:
                    url_tag = e_url.get('url')
                    if url_tag:
                        tmp_list = x_urls.get(url_tag, [])
                        tmp_list.append(e_url.get('expanded_url'))
                        x_urls[url_tag] = tmp_list
            medias = entities.get("media")
            if medias:
                for media in medias:
                    media_tag = media.get('url')
                    if media_tag:
                        tmp_list = x_medias.get(media_tag, [])
                        tmp_list.append(media.get('media_url_https'))
                        x_medias[media_tag] = tmp_list

        extended_entities = legacy.get('extended_entities')
        if extended_entities:
            e_urls = extended_entities.get("urls")
            if e_urls:
                for e_url in e_urls:
                    url_tag = e_url.get('url')
                    if url_tag:
                        tmp_list = x_urls.get(url_tag, [])
                        tmp_list.append(e_url.get('expanded_url'))
                        x_urls[url_tag] = tmp_list
            medias = extended_entities.get("media")
            if medias:
                for media in medias:
                    media_tag = media.get('url')
                    if media_tag:
                        tmp_list = x_medias.get(media_tag, [])
                        tmp_list.append(media.get('media_url_https'))
                        x_medias[media_tag] = tmp_list

        x_data['urls'] = x_urls
        x_data['medias'] = x_medias

        x_item['data'] = x_data

        return x_item

# with open('./data.json', 'r', encoding='utf-8') as f:
#     data = json.load(f)
#     parse_user_timeline(data)




