from argparse import ArgumentParser
from ImageService import ImageService

import sys
sys.path.insert(0, 'MLCore/')
from ML_dispatcher import MLDispatcher

arg_parser = ArgumentParser(
        'MLCore_img_service'
)

arg_parser.add_argument(
        '--mongo_addr',
        type=str,
        default='mongodb',
        help='mongodb host address'
    )

arg_parser.add_argument(
        '--mongo_port',
        type=int,
        default=27017,
        help='port of mongoDB'
    )

arg_parser.add_argument(
        '--mongo_DB_name',
        type=str,
        default='CLEVERSEARCH',
        help='name of mongo database'
    )

arg_parser.add_argument(
        '--mongo_collection_name',
        type=str,
        default='files',
        help='name of mongo collection'
    )

if __name__ == '__main__':
    args = arg_parser.parse_args()

    dispathcer = MLDispatcher(
            mongo_ip=args.mongo_addr,
            mongo_port=args.mongo_port,
            mongo_db_name=args.mongo_DB_name,
            mongo_collection=args.mongo_collection_name
    )

    dispathcer.reg_service(ImageService, 'img')

    dispathcer.run()