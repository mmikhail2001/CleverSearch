from pymongo.collection import Collection
from pymongo import MongoClient
from PIL import Image
from minio import Minio
import os
import logging
import sys
sys.path.insert(1, 'MLCore/')
sys.path.insert(2, 'MLCore/Services')
sys.path.insert(3, 'MLCore/Processors')
sys.path.insert(4, './MLCore/utils')
from utils.get_console_logger import get_console_logger
from service_interfaces import IDataService
from Processors.ImageProcessor import ImageProcessor
from Processors import IDataProcessor


logger = get_console_logger(
    __name__,
    logging.INFO
)


class ImageService(IDataService):
    def __init__(
            self,
            proc_cls: IDataProcessor = ImageProcessor,
            num_of_insts: int = 1,
            mongo_collection: Collection = None,
            minio_client: Minio = None,
            craft_weights_path: str = './MLCore/weights/craft_mlt_25k.pth',
            cpu: bool = True
            ):
        if mongo_collection is None:
            raise ValueError('Mongo collection instance error')
        
        self.mongo_collection = mongo_collection
        self.minio_client = minio_client
        self.num_of_insts = num_of_insts
        self.worker = proc_cls(craft_weights_path, cpu)

    def update_collection_file(self, uuid: str):

        document = self.mongo_collection.find_one({'_id': uuid})

        local_file_path = f'./{document["bucket"]}_{document["path"][1:]}'

        self.minio_client.fget_object(
            document['bucket'],
            document['path'],
            local_file_path
        )
        
        text_embeddings = self.worker.process(
            Image.open(
                local_file_path
            )
        )

        if text_embeddings:
            self.__insert_text_repr_data(
                document,
                text_embeddings
            )

        os.remove(local_file_path)

    def __insert_text_repr_data(self, document, text_embeddings):

        emds_vec = [embd[0] for embd in text_embeddings] 

        upd_query = {
            '$set':
            {
                'ml_data': {
                    'text_repr': text_embeddings
                }
            }
        }

        self.mongo_collection.update_one(
            {'_id': document['_id']}, upd_query
        )


if __name__ == '__main__':
    client = MongoClient('mongodb://localhost:1488')
    collection = client['CleverSearch']['files']

    service = ImageService(
        mongo_collection=collection
    )

    service.insert_into_collection(
        {
            'uuid': 'uuid',
            'url': './hwt_rus.jpg',
            'type': 'img'
        }
    )
