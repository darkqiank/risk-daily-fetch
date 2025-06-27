# 启动说明
0.配置环境变量
cp env.example .env

1. 先启动数据库
docker compose -f db-docker-compose.yml up -d

2. 手动创建数据库prefect

3. 启动prefect
docker compose -f prefect-docker-compose.yml up -d