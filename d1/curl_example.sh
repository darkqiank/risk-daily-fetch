curl -X GET "http://127.0.0.1:8787/api/blogs"

curl -X POST "http://127.0.0.1:8787/api/blogs" \
     -H "Content-Type: application/json" \
     -d '[{"link": "https://example.com", "source": "Example Source 2"},{"link": "https://example1.com", "source": "Example Source 2"}]'

curl -X GET "http://127.0.0.1:8787/api/blogs/2024-08-27"
