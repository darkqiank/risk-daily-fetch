from pykafka import KafkaClient
import os
import json

kafka_nodes = os.getenv("KAFKA_NODES")
print(kafka_nodes)
kafka_client = KafkaClient(hosts=kafka_nodes)

def get_kafka_client():
    return kafka_client

def get_kafka_topic(topic_name):
    return kafka_client.topics[topic_name.encode()]

def send_to_kafka(info_list, kafka_client):
    """
    根据 info_list 中的数据类型发送到对应 Kafka topic，同时避免多余字段干扰。
    """
    print.info("Kafka发送开始")
    topic_mapping = {
        'ip': kafka_client.topics[b'ipReputation'],
        'domain': kafka_client.topics[b'domainReputation'],
        'file': kafka_client.topics[b'fileInfo'],
        'url': kafka_client.topics[b'urlReputation']
    }

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
            print(f"未知数据类型或结构: {info}, 跳过该条数据。")
            continue

        with kafka_topic.get_producer() as producer:
            try:
                python_to_json = json.dumps(info, ensure_ascii=False)
                producer.produce(python_to_json.encode())
            except Exception as e:
                print(f"Kafka发送异常: {e}")
                continue

    print("Kafka发送结束")

