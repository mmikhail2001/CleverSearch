from IDataProcessor import IDataProcessor
from TextPreprocessor import TextPreprocessor, TextReader
from transformers import AutoModel, AutoTokenizer
import logging
import sys
sys.path.insert(0, './MLCore/utils')
from utils.get_console_logger import get_console_logger

logger = get_console_logger(
    __name__,
    logging.INFO
)


class TextProcessor(IDataProcessor):
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained(
            "cointegrated/rubert-tiny"
            )
        self.model = AutoModel.from_pretrained("cointegrated/rubert-tiny")
        self.model.eval()

    def process(self, filename):
        preprocessor = TextPreprocessor(
            TextReader(filename)
        )
        text = preprocessor.process()

        logger.debug(f'preprocessed text: {text}')

        embeddings = []

        for sentence in text:
            encodes = self.tokenizer(
                sentence,
                return_tensors='pt',
                padding=True)

            embedding = self.model(**encodes).last_hidden_state[:, 0, :]
            embeddings.append(embedding.tolist())

        return embeddings

    def process_query_string(self, query_string):
        text_processor = TextProcessor(query_string)
        processed_text = text_processor.process()
        query_tokens = self.tokenizer(
            processed_text,
            return_tensors='pt',
            padding=True)

        query_embedding = self.model(**query_tokens).last_hidden_state[:, 0, :]
        return query_embedding.tolist()
