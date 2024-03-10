from argparse import ArgumentParser
from ML_dispatcher import MLDispatcher
import sys
sys.path.insert(1, './MLCore/')
sys.path.insert(2, './MLCore/Services')
from Services.ImageService import ImageService
from Services.RecomendationService import RecomendationService

arg_parser = ArgumentParser('MLCore', description='heart of ML in CleverSearch')



if __name__ == '__main__':
    dispathcer = MLDispatcher()

    dispathcer.reg_service(ImageService, 'image')

    dispathcer.run()