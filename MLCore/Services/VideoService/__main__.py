from configparser import ConfigParser
from VideoService import VideoService

import sys
sys.path.insert(0, 'MLCore/')
from ML_dispatcher import MLDispatcher


if __name__ == '__main__':
    config = ConfigParser()
    config.read('./MLCore/Services/services_cfg.cfg')

    dispathcer = MLDispatcher(
            mongo_ip=config['COMMON']['MongoDBHostAddr'],
            mongo_port=config['COMMON']['MongoDBPort'],
            mongo_db_name=config['COMMON']['MongoDBName'],
            mongo_collection=config['COMMON']['MongoCollectionName']
    )

    dispathcer.reg_service(VideoService, 'video')

    dispathcer.run(
        exchange_name=config['RABBITMQ']['ExchangeName'],
        queue_name=config['VIDEO_SERV']['QueueName'],
        routing_key=config['VIDEO_SERV']['RoutingKey']
    )
