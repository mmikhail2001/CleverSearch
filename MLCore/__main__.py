from argparse import ArgumentParser
from ML_dispatcher import MLDispatcher
import uvicorn
import sys
sys.path.insert(1, './MLCore/')
sys.path.insert(2, './MLCore/Services')
from Services.ImageService import ImageService
from Services.RecomendationService import RecomendationService, app

arg_parser = ArgumentParser('MLCore', description='heart of ML in CleverSearch')

arg_parser.add_argument('--search_serv_port', type=int, default='22869', help='port of searching handler')



if __name__ == '__main__':

    args = arg_parser.parse_args()

    uvicorn.run(
        app, port=args.search_serv_port
    )

    rec_service = RecomendationService()

    dispathcer = MLDispatcher()

    dispathcer.reg_service(ImageService, 'image')

    dispathcer.run()