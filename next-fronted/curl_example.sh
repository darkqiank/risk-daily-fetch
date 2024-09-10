curl -X GET "http://127.0.0.1:8787/api/blog" \
	-H "X-AUTH-KEY: 572ce5667e425a"
curl -X GET "http://127.0.0.1:8787/api/blog/s3/cn"

curl -X POST "http://127.0.0.1:3000/api/blog" \
     -H "Content-Type: application/json" \
     -d '[{"url": "https://example.com", "blog_name": "Example Source 2"},{"url": "https://example1.com", "blog_name": "Example Source 2"}]'

curl -X GET "http://127.0.0.1:8787/api/blogs/2024-08-27" \
	-H "X-AUTH-KEY: 572ce5667e425a"


curl -X POST "http://127.0.0.1:3000/api/x" \
     -H "Content-Type: application/json" \
     -d '[{"x_id":"tweet-1825471250677813272","itemType":"TimelineTweet","data":{"created_at":"Mon Aug 19 09:53:56 +0000 2024","bookmark_count":5,"favorite_count":16,"full_text":"QiAnXin Cyber Threat Report H1 2024 is released👇\n* Besides known #APT, other threats without clear attribution (UTG) targeting China are also mentioned\n* Covers ransomware activities, other kinds of cybercrime and 0-days in the first half of 2024\n\nhttps://t.co/jOUsc85tql","urls":{"https://t.co/jOUsc85tql":["https://ti.qianxin.com/uploads/2024/08/19/2274f632f6a1d8acd2f1801c24887edb.pdf"]},"medias":{}},"username":"RedDrip Team","user_id":"986796925612470272","user_link":"https://x.com/reddrip7"}]'

