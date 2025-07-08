from pykafka import KafkaClient
import os
import json
from prefect import flow, task, serve
from prefect.logging import get_run_logger
from prefect.runtime import flow_run, task_run
from prefect.context import TaskRunContext
import sys
from pathlib import Path
import asyncio
import dotenv
from datetime import timedelta
import time
import uuid

# Add the project root directory to Python path
sys.path.append(str(Path(__file__).parent.parent))
from spider.iocgpt.ioc_format import standardize_iocs
from workflows.cache import local_block
from spider.utils import hash_data

dotenv.load_dotenv()


def generate_ioc_task_id() -> str:
    task_name = task_run.task_name
    parameters = task_run.parameters
    name = parameters.get("blog_name", "default")
    return f"{task_name}_{name}_{int(time.time()*1000)}_{str(uuid.uuid4())[:8]}"


def gen_key(context: TaskRunContext, inputs: dict) -> str:
    info_list= inputs.get("info_list", [])
    task_name = context.task.name
    if info_list:
        return f"{task_name}-{hash_data(info_list)}"
    else:
        return None

@task(
    cache_expiration=timedelta(days=3),
    cache_key_fn=gen_key,
    persist_result=True,
    result_storage=local_block,
    task_run_name=generate_ioc_task_id, 
    retries=3, 
    retry_delay_seconds=5,
    log_prints=True
)
def send_to_kafka(info_list, kafka_client):
    """
    根据 info_list 中的数据类型发送到对应 Kafka topic，同时避免多余字段干扰。
    """
    logger = get_run_logger()
    logger.info("Kafka发送开始")
    topic_mapping = {
        'ip': kafka_client.topics[b'ipReputation'],
        'domain': kafka_client.topics[b'domainReputation'],
        'file': kafka_client.topics[b'fileInfo'],
        'url': kafka_client.topics[b'urlReputation']
    }

    send_count = 0
    for info in info_list:
        # 如果不需要发送，直接跳过不发送
        if not info.get("send2kafka", True):
            continue

        # 清理无关字段
        info.pop("send2kafka", None)
        if 'tags' in info:
            info.pop('tags')
        if 'family' in info:
            info.pop('family')

        # 判断数据类型
        data_type = info.get('data_type')
        if data_type == 'file':
            kafka_topic = topic_mapping.get('file')
        elif 'ip' in info:
            kafka_topic = topic_mapping.get('ip')
        elif 'domain' in info:
            kafka_topic = topic_mapping.get('domain')
        elif 'url' in info:
            kafka_topic = topic_mapping.get('url')
        else:
            logger.error(f"未知数据类型或结构: {info}, 跳过该条数据。")
            continue

        with kafka_topic.get_producer() as producer:
            try:
                python_to_json = json.dumps(info, ensure_ascii=False)
                producer.produce(python_to_json.encode())
            except Exception as e:
                logger.error(f"Kafka发送异常: {e}")
                continue
        send_count += 1

    logger.info(f"Kafka发送结束，发送了 {send_count} 条数据")
    return send_count

@flow(name="send_iocs_to_kafka", log_prints=True)
async def send_iocs_to_kafka():
    logger = get_run_logger()
    kafka_nodes = os.getenv("KAFKA_NODES")
    kafka_client = KafkaClient(hosts=kafka_nodes)
    
    threat_feed_url = os.getenv("THREAT_FEED_URL")
    threats = []
    import aiohttp
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{threat_feed_url}") as response:
            res = await response.json()
            threats = res.get("data", [])

    logger.info(f"获取到 {len(threats)} 条威胁数据")

    total_send_count = 0
    for threat in threats:
        ioc_data = threat.get("extractionResult", {}).get("data")
        if not ioc_data:
            continue
        iocs = standardize_iocs(ioc_data, threat.get("link"))
        logger.info(f"标准化后的IOC数据: {iocs}")
        send_count = send_to_kafka(iocs, kafka_client)
        total_send_count += send_count

    logger.info(f"成功发送了 {total_send_count} 条数据")
    return total_send_count


if __name__ == "__main__":
    # asyncio.run(send_iocs_to_kafka())
    send_iocs_to_kafka_deployment = send_iocs_to_kafka.to_deployment(name="发送威胁数据到Kafka", 
                                                                     interval=timedelta(hours=1))
    serve(send_iocs_to_kafka_deployment)