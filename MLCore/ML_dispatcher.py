import pika
from pymongo import MongoClient
import json
import sys
sys.path.insert(5, './MLCore/')
sys.path.insert(6, './MLCore/Services')
from Services.ImageService import ImageService
from Services.service_interfaces import IDataService


class MLDispatcher:
    def __init__(
            self,
            rabbit_ip: str = 'localhost',
            rabbit_port:int = 1338,
            mongo_ip: str = 'localhost',
            mongo_port:int = 1488):
        self.ip = rabbit_ip
        self.port = rabbit_port
        self.client = MongoClient(f'mongodb://{mongo_ip}:{mongo_port}')
        self.collection = self.client['test']['test']
        self.services = {
            'image': None,
            'audio': None,
            'video': None,
            'document': None
        }

    def __callback(self, ch, method, properties, body):
            req = json.loads(
                 body.decode()
            )
            if self.services[req['type']] is None:
                raise ValueError('pizdec')
            self.services[req['type']].insert_into_collection(
                req
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
        self.services[type] = service_cls(mongo_collection = self.collection, *args, **kwargs)

disp = MLDispatcher()
disp.reg_service(ImageService, 'image')
disp.run()
