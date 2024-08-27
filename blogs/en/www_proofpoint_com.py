import requests

def get_links():
    url = "https://uvwaxg6fkn-dsn.algolia.net/1/indexes/*/queries?x-algolia-api-key=799411b73476846aa4902995845c8096&x-algolia-application-id=UVWAXG6FKN"

    payload = "{\"requests\":[{\"indexName\":\"blog\",\"params\":\"filters=search_api_language%3Aen%20AND%20category%3A10346&distinct=true&facetingAfterDistinct=true&hitsPerPage=10&query=&highlightPreTag=__ais-highlight__&highlightPostTag=__%2Fais-highlight__&page=0&facets=%5B%5D&tagFilters=\"}]}"
    headers = {
       'Accept': '*/*',
       'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6',
       'Connection': 'keep-alive',
       'Origin': 'https://www.proofpoint.com',
       'Referer': 'https://www.proofpoint.com/',
       'Sec-Fetch-Dest': 'empty',
       'Sec-Fetch-Mode': 'cors',
       'Sec-Fetch-Site': 'cross-site',
       'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36 Edg/127.0.0.0',
       'sec-ch-ua': '"Not)A;Brand";v="99", "Microsoft Edge";v="127", "Chromium";v="127"',
       'sec-ch-ua-mobile': '?0',
       'sec-ch-ua-platform': '"macOS"',
       'content-type': 'application/x-www-form-urlencoded'
    }

    response = requests.request("POST", url, headers=headers, data=payload, timeout=20)

    res = response.json()
    hits = res['results'][0]["hits"]
    links = []
    for hit in hits:
        link = f'https://www.proofpoint.com{hit["url"]}'
        links.append(link)
    print(links)
    return links

