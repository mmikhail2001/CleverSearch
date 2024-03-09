from pymongo.collection import Collection
from pymongo import MongoClient
from service_interfaces import IDataService
from PIL import Image

import sys
sys.path.insert(3, './MLCore/')
sys.path.insert(4, './MLCore/Processors')
from Processors.ImageProcessor import ImageProcessor
from Processors import IDataProcessor


class ImageService(IDataService):
    def __init__(
            self,
            proc_cls: IDataProcessor = ImageProcessor,
            num_of_insts: int = 1,
            mongo_collection: Collection = None,
            craft_weights_path: str = './MLCore/weights/craft_mlt_25k.pth',
            cpu: bool = True
            ):
        if mongo_collection is None:
            raise ValueError('pizdec')
        
        self.mongo_collection = mongo_collection
        self.num_of_insts = num_of_insts
        self.worker = proc_cls(craft_weights_path, cpu)

    def insert_into_collection(self, data: dict):  # {uuid: str, url: str, type: str} 
        proc_str = self.worker.process(
            Image.open(
                data['url']
            )
        )

        tf_idf = self.__get_tfidf(
            data['uuid'], data['type'], proc_str
        )

        self.mongo_collection.insert_one(
            {
                'uuid': data['uuid'],
                'type': data['type'],
                'text_context': proc_str,
                'url': data['url'],
                'embedding': tf_idf
            }
        )

    def __get_tfidf(self, uuid: str, type: str, current_doc: str):
        documents = self.get_docs(uuid, type)

        if documents:
            self.__reindex_docs(documents, current_doc)
        else:
            return [1 for i in range(10)]

    def __reindex_docs(documents: list[str], current_doc: str):
        pass
        

    def get_docs(self, uuid: str, type: str):
        query = {
            '$and': [
                {'uuid': uuid},
                {'type': type}
            ]
        }

        documents = list(
            self.mongo_collection.find(
                query
            )
        )

        return None if not len(documents) else documents


if __name__ == '__main__':
    client = MongoClient('mongodb://localhost:1488')
    collection = client['test']['test']

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