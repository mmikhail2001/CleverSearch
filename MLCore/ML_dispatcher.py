import pika
from pymongo import MongoClient
from minio import Minio
import json
import sys
sys.path.insert(5, './MLCore/')
sys.path.insert(6, './MLCore/Services')
from Services.ImageService import ImageService
from Services.service_interfaces import IDataService


class MLDispatcher:
    def __init__(
            self,
            rabbit_ip: str = 'rabbitmq',
            rabbit_port:int = 5672,
            mongo_ip: str = 'mongodb',
            mongo_port:int = 27018):
        self.ip = rabbit_ip
        self.port = rabbit_port
        self.client = MongoClient(f'mongodb://{mongo_ip}:{mongo_port}')
        self.minio_client = Minio(
            'minio:9000',
            access_key="minioadmin",
            secret_key="minioadmin",
            secure=False
        )
        
        self.collection = self.client['CleverSearch']['files']
        self.services = {
            'image': None,
            'audio': None,
            'video': None,
            'document': None
        }

    def __callback(self, ch, method, properties, body):
            doc_uuid = json.loads(
                body.decode()
            )['id']

            file_type = self.collection.find_one({'_id': doc_uuid})['type']

            self.services[file_type].update_collection_file(
                doc_uuid
            )

    def run(self):
        connection = pika.BlockingConnection(pika.ConnectionParameters(self.ip, self.port,\
            virtual_host='/',credentials=pika.PlainCredentials('guest', 'guest'), heartbeat=600, blocked_connection_timeout=300))
        channel = connection.channel()

        queue_name = 'transmit_queue'

        channel.basic_consume(queue=queue_name, on_message_callback=self.__callback, auto_ack=True)

        channel.start_consuming()

    def reg_service(self, service_cls: IDataService, type:str, *args, **kwargs):
        if type not in self.services.keys():
             raise TypeError(f'this type <{type}> not supported ((')
        self.services[type] = service_cls(mongo_collection = self.collection, minio_client = self.minio_client, *args, **kwargs)
