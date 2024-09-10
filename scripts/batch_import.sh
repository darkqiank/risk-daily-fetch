#!/bin/bash

# 设置开始和结束日期
start_date="2024-08-28"
end_date="2024-09-06"

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
  result=$(curl -s -X GET "http://127.0.0.1:3000/api/blog/s3/en?date=$date")

  # 执行 POST 请求
  curl -X POST "http://127.0.0.1:3000/api/blog" \
       -H "Content-Type: application/json" \
       -d "$result"

  # 将当前日期增加一天
  current=$(($current + 86400))
done
