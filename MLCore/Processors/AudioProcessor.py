import whisper
from IDataProcessor import IDataProcessor
from TextProcessor import TextProcessor

import sys
import logging
sys.path.insert(3, './MLCore/')
sys.path.insert(4, './MLCore/utils')
from utils.get_console_logger import get_console_logger

logger = get_console_logger(
    __name__,
    logging.DEBUG
)


class AudioProcessor(IDataProcessor):
    def __init__(self):
        self.model = whisper.load_model("base")

    def process(self, filename):
        transcript = self.model.transcribe(filename)

        embeddings = []
        timestamps = []

        text_processor = TextProcessor()

        for element in transcript['segments']:
            embedding = text_processor.process_query_string(element['text'])
            if embedding:
                embeddings.append(embedding)
                timestamps.append(element['start'])

        return embeddings, timestamps
