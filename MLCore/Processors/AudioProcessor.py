import whisper
from IDataProcessor import IDataProcessor
from TextPreprocessor import TextPreprocessor


class AudioProcessor(IDataProcessor):
    def __init__(self):
        print('init')
        self.model = whisper.load_model("base")
        print('init')

    def process(self, filename):
        print('process')
        transcript = self.model.transcribe(filename)
        print(transcript)

        preprocessor = TextPreprocessor(
            transcript
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
        print(embeddings)
        return embeddings
