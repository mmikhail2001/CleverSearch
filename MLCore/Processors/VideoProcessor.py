import os

from AudioProcessor import AudioProcessor
from IDataProcessor import IDataProcessor


class VideoProcessor(IDataProcessor):
    def __init__(self):
        self.audio_processor = AudioProcessor()

    def process(self, video_path):
        audio_path = video_path.split('.')[0] + '.mp3'

        os.system(f'ffmpeg -i {video_path} {audio_path} > /dev/null')

        result = self.audio_processor.process(audio_path)

        os.remove(audio_path)

        return result
