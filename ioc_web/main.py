from fastapi import FastAPI, Query, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from typing import Optional
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
import os
from datetime import datetime, timedelta
import json

# 初始化 FastAPI 应用
app = FastAPI()

# 设置 Jinja2 模板目录
templates = Jinja2Templates(directory="templates")

# 加载 .env 文件
load_dotenv()

# 数据库连接配置
DATABASE_CONFIG = {
    "dbname": os.getenv('DB_NAME'),
    "user": os.getenv('DB_USER'),
    "password": os.getenv('DB_PASSWORD'),
    "host": os.getenv('DB_HOST'),
    "port": os.getenv('DB_PORT')
}

# 数据库查询函数
def fetch_data(start_date: Optional[str] = None, end_date: Optional[str] = None):
    # 如果 start_date 为空，默认为昨天的日期
    if start_date is None:
        start_date = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')

    query = """
        SELECT url, source, inserted_at, extraction_result
        FROM threat_intelligence
        WHERE 1=1
    """
    params = []
    if start_date:
        query += " AND inserted_at >= %s"
        params.append(start_date)
    if end_date:
        query += " AND inserted_at <= %s"
        params.append(end_date)

    connection = psycopg2.connect(**DATABASE_CONFIG)
    with connection.cursor(cursor_factory=RealDictCursor) as cursor:
        cursor.execute(query, params)
        results = cursor.fetchall()
    connection.close()
    return results

# 定义接口，返回 HTML 页面
@app.get("/", response_class=HTMLResponse)
async def read_data(
        request: Request,
        start_date: Optional[str] = Query(None, description="筛选起始日期 (YYYY-MM-DD)"),
        end_date: Optional[str] = Query(None, description="筛选结束日期 (YYYY-MM-DD)")
):
    # 从数据库中读取数据
    records = fetch_data(start_date=start_date, end_date=end_date)
    ioc_records = []
    # 解析 extraction_result 为 JSON 对象
    for record in records:
        if record['extraction_result'].get("data", {}).get("iocs"):
            ioc_records.append(record)

    # 返回 HTML 页面
    return templates.TemplateResponse(
        "index.html",
        {"request": request, "records": ioc_records, "start_date": start_date, "end_date": end_date},
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
