import pika
from pymongo import MongoClient
from minio import Minio
import json
import sys
import requests
import logging
sys.path.insert(5, './MLCore/')
sys.path.insert(6, './MLCore/Services')
sys.path.insert(7, './MLCore/utils')
from utils.get_console_logger import get_console_logger
from Services.service_interfaces import IDataService


logger = get_console_logger(
    __name__,
    logging.DEBUG
)


class MLDispatcher:
    def __init__(
            self,
            rabbit_ip: str = 'rabbitmq',
            rabbit_port:int = 5672,
            mongo_ip: str = 'mongodb',
            mongo_port:int = 27017,
            mongo_db_name: str = 'CleverSearch',
            mongo_collection: str = 'files'):
        self.ip = rabbit_ip
        self.port = rabbit_port
        self.client = MongoClient(f'mongodb://USERNAME:PASSWORD@{mongo_ip}:{mongo_port}')
        self.minio_client = Minio(
            'minio:9000',
            access_key="minioadmin",
            secret_key="minioadmin",
            secure=False
        )
        
        self.collection = self.client[mongo_db_name][mongo_collection]

        self.services = {
            'img': None,
            'audio': None,
            'video': None,
            'text': None
        }

    def __callback(self, ch, method, properties, body):
            doc_uuid = json.loads(
                body.decode()
            )['id']

            logging.critical(f'decoded body: {body.decode()}')

            doc_meta = self.collection.find_one({'_id': doc_uuid})

            file_type = doc_meta['file_type']

            logging.critical(f'doc_uuid: {doc_uuid} || file type: {file_type}')

            if doc_meta['status'] != 'processed':
                sucsess_processed_status = self.services[file_type].update_collection_file(
                    doc_uuid
                )
                if sucsess_processed_status:
                    requests.post(f'http://backend:8080/api/ml/complete?file_uuid={doc_uuid}')


    def run(self, queue_name: str):
        connection = pika.BlockingConnection(pika.ConnectionParameters(self.ip, self.port,\
            virtual_host='/',credentials=pika.PlainCredentials('guest', 'guest'), heartbeat=600, blocked_connection_timeout=300))
        channel = connection.channel()

        channel.basic_consume(queue=queue_name, on_message_callback=self.__callback, auto_ack=True)

        channel.start_consuming()

    def reg_service(self, service_cls: IDataService, type:str, *args, **kwargs):
        if type not in self.services.keys():
             raise TypeError(f'this type <{type}> not supported ((')
        self.services[type] = service_cls(mongo_collection = self.collection, minio_client = self.minio_client, *args, **kwargs)
