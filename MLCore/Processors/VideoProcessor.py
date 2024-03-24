from AudioProcessor import AudioProcessor
from IDataProcessor import IDataProcessor
from moviepy.editor import VideoFileClip


class VideoProcessor(IDataProcessor):
    def __init__(self):
        self.audio_processor = AudioProcessor()

    def process(self, video_path):
        audio_path = video_path.split('.')[0] + '.mp3'

        video = VideoFileClip(video_path)
        audio = video.audio

        audio.write_audiofile(audio_path)

        audio.close()
        video.close()

        return self.audio_processor.process(audio_path)
