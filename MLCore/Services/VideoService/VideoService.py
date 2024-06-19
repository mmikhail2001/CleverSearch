from minio import Minio

import sys
sys.path.insert(1, 'MLCore/')
sys.path.insert(2, 'MLCore/Services')
sys.path.insert(3, 'MLCore/Processors')

from Processors import IDataProcessor
from Processors.VideoProcessor import VideoProcessor
from pymongo.collection import Collection
from AudioService.AudioService import AudioService


class VideoService(AudioService):
    def __init__(
            self,
            proc_cls: IDataProcessor = VideoProcessor,
            num_of_insts: int = 1,
            mongo_collection: Collection = None,
            minio_client: Minio = None,
            ):
        super().__init__(
            proc_cls, num_of_insts, mongo_collection, minio_client
        )
