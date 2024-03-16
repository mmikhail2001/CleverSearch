import re

import nltk
import pymorphy2
from pypdf import PdfReader

nltk.download('stopwords')
from nltk.corpus import stopwords
import logging
import sys
sys.path.insert(0, './MLCore/utils')
from utils.get_console_logger import get_console_logger

logger = get_console_logger(
    __name__,
    logging.DEBUG
)

class TextReader:
    def __init__(self, filename) -> None:
        self.reader = PdfReader(filename)
        self.text = ''
        for page in self.reader.pages:
            self.text += page.extract_text()

    def read(self):
        return self.text


class TextPreprocessor:
    def __init__(self, readable: str | TextReader) -> None:
        self.morph = pymorphy2.MorphAnalyzer()
        self.stopwords_ru = stopwords.words("russian")
        if isinstance(readable, str):
            self.text = readable
        else:
            self.text = readable.read()
        logger.info(self.text)

    def process(self):
        cleaned_text = self.__clean_string(self.text)
        cleaned_text = ' '.join(cleaned_text.split())

        sentences = cleaned_text.split('.')

        sentences = list(map(self.__remove_nonexistent_words, sentences))

        filtered_list = [string for string in sentences if len(string) > 2]

        lemmatized_list = list(map(self.__lemmatize, filtered_list))

        filtered_strings = list(map(self.__delete_stopwords, lemmatized_list))

        joined_string = [' '.join(string) for string in filtered_strings]

        return joined_string

    def __clean_string(self, input_string):
        cleaned_string = re.sub(r'[^a-zA-Zа-яА-Я.,!? ]', '', input_string)
        return cleaned_string

    def __remove_nonexistent_words(self, input_string):
        string_with_existing_words = ' '.join([word for word
                                    in input_string.split()
                                    if self.morph.word_is_known(word)])
        return string_with_existing_words

    def __lemmatize(self, doc):
        tokens = []
        for token in doc.split():
            if token and token not in self.stopwords_ru:
                token = token.strip()
                token = self.morph.normal_forms(token)[0]
                tokens.append(token)
        return tokens

    def __delete_stopwords(self, input_string):
        filtered_sentence = [w for w in input_string
                            if not w.lower() in self.stopwords_ru]
        return filtered_sentence
