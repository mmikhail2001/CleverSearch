import sys
from argparse import ArgumentParser
import os
import uvicorn
from ML_dispatcher import MLDispatcher

from Services.ImageService import ImageService
from Services.RecomendationService import setup_search_handler, app
sys.path.insert(1, './MLCore/')
sys.path.insert(2, './MLCore/Services')

arg_parser = ArgumentParser(
        'MLCore',
        description='heart of ML in CleverSearch'
        )

arg_parser.add_argument(
        '--search_serv_port',
        type=int,
        default=8081,
        help='port of searching handler'
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


def main(args):
    pid = os.fork()

    if pid:
        dispathcer = MLDispatcher(
            mongo_ip=args.mongo_addr,
            mongo_port=args.mongo_port,
            mongo_db_name=args.mongo_DB_name,
            mongo_collection=args.mongo_collection_name
        )

        dispathcer.reg_service(ImageService, 'image/jpeg')

        dispathcer.run()
    else:

        setup_search_handler(args)

        uvicorn.run(
            app,
            host='0.0.0.0',
            port=args.search_serv_port
        )

if __name__ == '__main__':

    args = arg_parser.parse_args()

    main(args)
