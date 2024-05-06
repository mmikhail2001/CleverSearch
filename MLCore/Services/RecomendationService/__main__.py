from argparse import ArgumentParser
import uvicorn
from RecomendationService import setup_search_handler, app

arg_parser = ArgumentParser(
        'MLCore_SearchService'
        )

arg_parser.add_argument(
        '--search_serv_port',
        type=int,
        default=8081,
        help='port of searching handler'
    )

if __name__ == '__main__':
        args = arg_parser.parse_args()

        setup_search_handler(args)

        uvicorn.run(
            app,
            host='0.0.0.0',
            port=args.search_serv_port
        )