from IDataProcessor import IDataProcessor
from TextPreprocessor import TextPreprocessor
from transformers import AutoModel, AutoTokenizer


class TextProcessor(IDataProcessor):
    def __init__(self):
        self.tokenizer = AutoTokenizer.from_pretrained(
            "cointegrated/rubert-tiny"
            )
        self.model = AutoModel.from_pretrained("cointegrated/rubert-tiny")
        self.model.eval()

    def process(self, filename):
        preprocessor = TextPreprocessor(filename)
        text = preprocessor.process()

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
