from IDataProcessor import IDataProcessor
from TextPreprocessor import TextPreprocessor, TextReader
from transformers import AutoModel, AutoTokenizer

import sys
import logging
sys.path.insert(3, './MLCore/')
sys.path.insert(4, './MLCore/utils')
from utils.get_console_logger import get_console_logger

logger = get_console_logger(
    __name__,
    logging.DEBUG
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

        embeddings = []
        pages = []

        for i, text_page in text:
            logger.info(f'preprocessed text: {text_page}')

            for sentence in text_page:
                encodes = self.tokenizer(
                    sentence,
                    return_tensors='pt',
                    padding=True)

                embedding = self.model(**encodes).last_hidden_state[:, 0, :]
                logger.info(embedding.shape)
                embeddings.append(embedding.squeeze(0).tolist())
                pages.append(i)

        return embeddings, pages

    def process_query_string(self, query_string):
        logger.info(f'query string: {query_string}')
        text_processor = TextPreprocessor(query_string)

        processed_text = text_processor.process()

        if len(processed_text):
            processed_text = text_processor.process()[0][1]
            logger.info(f'processed text: {processed_text}')
            query_tokens = self.tokenizer(
                processed_text,
                return_tensors='pt',
                padding=True)

            query_embedding = self.model(**query_tokens).last_hidden_state[:, 0, :]
            return query_embedding.squeeze(0).tolist()
        else:
            return None
