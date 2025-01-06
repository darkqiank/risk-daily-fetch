#!/bin/bash

export http_proxy="http://127.0.0.1:10808"
export https_proxy="http://127.0.0.1:10808"

# 设置开始和结束日期
start_date="2024-09-16"
end_date="2024-09-16"

# 将日期格式化为秒数
start=$(date -j -f "%Y-%m-%d" "$start_date" "+%s")
end=$(date -j -f "%Y-%m-%d" "$end_date" "+%s")

# 循环遍历日期范围
current=$start
while [ $current -le $end ]; do
  # 将当前日期格式化为 yyyy-mm-dd
  date=$(date -j -f "%s" "$current" "+%Y-%m-%d")
  echo $date

  # 执行 GET 请求并获取结果
  result=$(curl -s -X GET "https://risk-daily-fetch.vercel.app/api/x/s3?date=$date")

  # 执行 POST 请求
  curl -X POST "https://risk-daily-fetch.vercel.app/api/x" \
       -H "Content-Type: application/json" \
       -H "X-AUTH-KEY: 1111111" \
       -d "$result"

  # 将当前日期增加一天
  current=$(($current + 86400))
done
