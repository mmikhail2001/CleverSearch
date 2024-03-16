import os

from minio import Minio
import logging
from Processors import IDataProcessor
from Processors.TextProcessor import TextProcessor
from pymongo.collection import Collection
from service_interfaces import IDataService
import sys
sys.path.insert(0, './MLCore/utils')
from utils.get_console_logger import get_console_logger


logger = get_console_logger(
    __name__,
    logging.DEBUG
)



class TextService(IDataService):
    def __init__(
            self,
            proc_cls: IDataProcessor = TextProcessor,
            num_of_insts: int = 1,
            mongo_collection: Collection = None,
            minio_client: Minio = None,
            ):
        if mongo_collection is None:
            raise ValueError('db not found')

        self.mongo_collection = mongo_collection
        self.minio_client = minio_client
        self.num_of_insts = num_of_insts
        self.worker = proc_cls()

        logger.info('Text Service ')

    def update_collection_file(self, uuid: str):

        document = self.mongo_collection.find_one({'_id': uuid})

        local_file_path = f'./{document["bucket"]}_{document["path"][1:]}'

        self.minio_client.fget_object(
            document['bucket'],
            document['path'],
            local_file_path
        )

        proc_list = self.worker.process(local_file_path)
        logger.debug(proc_list)

        os.remove(local_file_path)

        upd_query = {
            '$set':
            {
                'ml_data': {
                    'text_repr': proc_list
                }
            }
        }

        self.mongo_collection.update_one(
            {'_id': document['_id']}, upd_query
        )
