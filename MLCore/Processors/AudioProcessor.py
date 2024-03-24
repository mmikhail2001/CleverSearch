import whisper
from IDataProcessor import IDataProcessor
from TextPreprocessor import TextPreprocessor


class AudioProcessor(IDataProcessor):
    def __init__(self):
        self.model = whisper.load_model("base")

    def process(self, filename):
        transcript = self.model.transcribe(filename)

        preprocessor = TextPreprocessor(
            transcript['text']
        )
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
