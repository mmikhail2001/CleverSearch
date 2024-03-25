import os

from minio import Minio
from Processors import IDataProcessor
from Processors.VideoProcessor import VideoProcessor
from pymongo.collection import Collection
from service_interfaces import IDataService


class AudioService(IDataService):
    def __init__(
            self,
            proc_cls: IDataProcessor = VideoProcessor,
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

    def update_collection_file(self, uuid: str):

        document = self.mongo_collection.find_one({'_id': uuid})

        local_file_path = f'./{document["bucket"]}_{document["path"][1:]}'

        self.minio_client.fget_object(
            document['bucket'],
            document['path'],
            local_file_path
        )

        proc_list, timestamps = self.worker.process(local_file_path)

        os.remove(local_file_path)

        upd_query = {
            '$set':
            {
                'ml_data': {
                    'text_repr': proc_list,
                    'timestamp': timestamps
                }
            }
        }

        self.mongo_collection.update_one(
            {'_id': document['_id']}, upd_query
        )
