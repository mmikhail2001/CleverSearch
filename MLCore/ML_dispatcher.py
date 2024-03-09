import pika
from pymongo import MongoClient


class MLDispatcher:
    def __init__(self, ip: str = 'localhost', port:int = 1338):
        self.ip = ip
        self.port = port
        self.client = MongoClient('mongodb://localhost:1488')
        self.collection = self.client['test']['test']

    def __callback(self, ch, method, properties, body):
            print(body.decode())

    def run(self):
        connection = pika.BlockingConnection(pika.ConnectionParameters(self.ip, self.port,\
            virtual_host='/',credentials=pika.PlainCredentials('guest', 'guest'), heartbeat=600, blocked_connection_timeout=300))
        channel = connection.channel()

        queue_name = 'transmit_queue'

        channel.basic_consume(queue=queue_name, on_message_callback=self.__callback, auto_ack=True)

        channel.start_consuming()


dispatcher = MLDispatcher()
dispatcher.run()
