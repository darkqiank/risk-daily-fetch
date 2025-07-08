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
from collections import defaultdict

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
        return f"{task_name}-{hash_data(str(info_list))}"
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
    将 info_list 中数据按类型发送到 Kafka 各自 topic，统一使用 producer 批量发送。
    """
    logger = get_run_logger()
    logger.info("Kafka 批量发送开始")

    # 主题映射
    topic_mapping = {
        'ip': kafka_client.topics[b'ipReputation'],
        'domain': kafka_client.topics[b'domainReputation'],
        'file': kafka_client.topics[b'fileInfo'],
        'url': kafka_client.topics[b'urlReputation']
    }

    # 分类存储待发送数据
    type_to_messages = defaultdict(list)

    for info in info_list:
        if not info.get("send2kafka", True):
            continue

        info = {k: v for k, v in info.items() if k not in ['send2kafka', 'tags', 'family']}
        data_type = info.get('data_type')

        if data_type == 'file':
            topic_key = 'file'
        elif 'ip' in info:
            topic_key = 'ip'
        elif 'domain' in info:
            topic_key = 'domain'
        elif 'url' in info:
            topic_key = 'url'
        else:
            logger.error(f"未知数据类型或结构: {info}, 跳过。")
            continue

        try:
            json_data = json.dumps(info, ensure_ascii=False).encode()
            type_to_messages[topic_key].append(json_data)
        except Exception as e:
            logger.warning(f"转换为 JSON 失败: {e}，跳过此条")

    send_count = 0
    # 分类型发送
    for topic_key, messages in type_to_messages.items():
        topic = topic_mapping.get(topic_key)
        if not topic:
            logger.warning(f"未找到 topic: {topic_key}")
            continue

        try:
            producer = topic.get_sync_producer()
            for msg in messages:
                producer.produce(msg)
            send_count += len(messages)
        except Exception as e:
            logger.error(f"Kafka 发送失败 ({topic_key}): {e}")
            continue

    logger.info(f"Kafka 批量发送结束，共发送 {send_count} 条数据")
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
                                                                     interval=timedelta(hours=3))
    serve(send_iocs_to_kafka_deployment)