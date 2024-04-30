import logging
import os

from AudioProcessor import AudioProcessor
from IDataProcessor import IDataProcessor
from utils.get_console_logger import get_console_logger

logger = get_console_logger(
            __name__,
            logging.DEBUG
        )

class VideoProcessor(IDataProcessor):
    def __init__(self):
        self.audio_processor = AudioProcessor()

    def process(self, video_path):
        os.rename(video_path, video_path.replace(' ', ''))

        video_path = video_path.replace(' ', '')
        audio_path = video_path.split('.')[0] + '.mp3'

        logger.info(f'audio_path: {audio_path}')

        os.system(f'ffmpeg -i {video_path} {audio_path} > /dev/null')

        result = self.audio_processor.process(audio_path)

        os.remove(audio_path)

        return result
