import os
from openai import OpenAI

client = OpenAI(
    api_key = os.environ.get("OPENAI_API_KEY"),
    base_url = os.environ.get("OPENAI_BASE_URL"),
)

# Non-streaming:
print("----- standard request -----")
completion = client.chat.completions.create(
    model = "ep-20250327095011-bsgcv",  # your model endpoint ID
    messages = [
        {"role": "system", "content": "你是数据采集器代码生成助手"},
        {"role": "user", "content": "常见的十字花科植物有哪些？"},
    ],
)
print(completion.choices[0].message.content)