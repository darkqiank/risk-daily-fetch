from pykafka import KafkaClient
import os

kafka_nodes = os.getenv("KAFKA_NODES")
print(kafka_nodes)
kafka_client = KafkaClient(hosts=kafka_nodes)

def get_kafka_client():
    return kafka_client

def get_kafka_topic(topic_name):
    return kafka_client.topics[topic_name.encode()]

