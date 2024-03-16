import torch
from transformers import AutoTokenizer, AutoModel
import logging
import numpy as np
from IDataProcessor import IDataProcessor
from PIL import Image
from collections import OrderedDict
import sys
from easyocr import Reader
from TextPreprocessor import TextPreprocessor
sys.path.insert(1, '/')
sys.path.insert(2, '/CRAFT/')
from CRAFT.craft import CRAFT
from CRAFT.test import test_net


sys.path.insert(0, './MLCore/utils')
from utils.get_console_logger import get_console_logger

logger = get_console_logger(
    __name__,
    logging.INFO
)



class ImageProcessor(IDataProcessor):
    def __init__(self, craft_weights_path = None, cpu: bool =True):
        if craft_weights_path is None:
            raise ValueError('enter a path to CRAFT weights')
        self.craft_weights_path = craft_weights_path

        self.craft_instance = CRAFT()
        self.craft_instance.eval()

        self.reader = Reader(['ru'], gpu=not cpu)

        if cpu:
            self.craft_instance.load_state_dict(self.__copyStateDict(torch.load(self.craft_weights_path, map_location='cpu')))
        else:
            self.craft_instance.load_state_dict(self.__copyStateDict(torch.load(self.craft_weights_path)))

        logger.info('CRAFT init >> status: success')

        BERT_MODEL_NAME = 'cointegrated/rubert-tiny'

        self.bert_tokenizer = AutoTokenizer.from_pretrained(BERT_MODEL_NAME)
        self.bert = AutoModel.from_pretrained(BERT_MODEL_NAME)
        self.bert = self.bert.eval()

        logger.info('bert init >> status: success')
        
        logger.info('Image Processor started!')

    def process(self, img: Image)->str:
        try:
            bboxes = self.__get_text_bboxes(img)
            if not len(bboxes):
                logger.warning(f'{img.filename}: >> text not found')
            img_crops = self.__crop_image(img, bboxes)
            string = self.__get_string_from_crops(img_crops).lower()
            
            processed_str_list = TextPreprocessor(string).process()

            logger.debug(f'processed list: {processed_str_list} \n length: {len(processed_str_list)}')

            emds_list = self.__encode_processed_string(processed_str_list)

            return emds_list

        except Exception as e:
            logger.critical(
                e, exc_info=True
            )
            return None
    
    def __get_string_from_crops(self, crops: list)->str:
        result = []
        for crop in crops:
            word = self.reader.readtext(np.array(crop), detail=False)
            if len(word):
                result.append(
                    ' '.join(word)
                )

        return ' '.join(result)
    

    def __encode_processed_string(self, processed_string):
        embeddings = []
        for sentence in processed_string:
            tokens = self.bert_tokenizer(sentence, return_tensors='pt', padding=True)
            embeddings.append(
                self.bert(**tokens).last_hidden_state[:, 0, :]
            )

        return embeddings

    def __copyStateDict(self, state_dict):
        if list(state_dict.keys())[0].startswith("module"):
            start_idx = 1
        else:
            start_idx = 0
        new_state_dict = OrderedDict()
        for k, v in state_dict.items():
            name = ".".join(k.split(".")[start_idx:])
            new_state_dict[name] = v
        return new_state_dict

    def __get_text_bboxes(self, img: Image) -> list:
        bboxes, _, _ = test_net(self.craft_instance, np.array(img), 0.7, 0.4, 0.4, False, False)
        return bboxes

    def __crop_image(self, img: Image, bboxes: list[np.ndarray]) -> list:
        result = []
        for array in bboxes:
            concat_coords = np.hstack((array[0, :], array[2, :])).astype(np.int32)
            result.append(
                img.crop(
                    tuple(concat_coords)
                )
            )
        return result
