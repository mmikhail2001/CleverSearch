import sys
from argparse import ArgumentParser
import os
import uvicorn
from ML_dispatcher import MLDispatcher

from Services.ImageService import ImageService
from Services.RecomendationService import search, app
sys.path.insert(1, './MLCore/')
sys.path.insert(2, './MLCore/Services')

arg_parser = ArgumentParser(
        'MLCore',
        description='heart of ML in CleverSearch'
        )

arg_parser.add_argument(
        '--search_serv_port',
        type=int,
        default='8081',
        help='port of searching handler'
    )


def main(args):
    pid = os.fork()

    if pid:
        dispathcer = MLDispatcher()

        dispathcer.reg_service(ImageService, 'image/jpeg')

        dispathcer.run()
    else:
        uvicorn.run(
            app,
            host='0.0.0.0',
            port=args.search_serv_port
        )

if __name__ == '__main__':

    args = arg_parser.parse_args()

    main(args)
