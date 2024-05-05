import torch
from transformers import AutoTokenizer, AutoModel
import logging
import numpy as np
# from IDataProcessor import IDataProcessor
from PIL import Image
import cv2 as cv
from collections import OrderedDict
import sys
from easyocr import Reader
from TextPreprocessor import TextPreprocessor
sys.path.insert(1, '/')
sys.path.insert(2, '/CRAFT/')
from CRAFT.craft import CRAFT
from CRAFT.test import test_net

sys.path.insert(3, './MLCore/')
sys.path.insert(4, './MLCore/utils')
from utils.get_console_logger import get_console_logger

logger = get_console_logger(
    __name__,
    logging.INFO
)

from tqdm import tqdm

class ImageProcessor(IDataProcessor):
    def __init__(self, craft_weights_path = None, cpu: bool =True):
        if craft_weights_path is None:
            raise ValueError('enter a path to CRAFT weights')
        self.craft_weights_path = craft_weights_path

        self.craft_instance = CRAFT()
        self.craft_instance.eval()

        self.reader = Reader(['ru', 'en'], gpu=not cpu)

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
        logger.info('decode crops to strings')
        for crop in tqdm(crops):
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

    def __get_right_points(self, points):
        a = ((points[1][0] - points[0][0]) ** 2 + (points[1][1] - points[0][1]) ** 2) ** 0.5
        b = ((points[2][0] - points[0][0]) ** 2 + (points[2][1] - points[0][1]) ** 2) ** 0.5
        c = ((points[3][0] - points[2][0]) ** 2 + (points[3][1] - points[2][1]) ** 2) ** 0.5
        d = ((points[3][0] - points[1][0]) ** 2 + (points[3][1] - points[1][1]) ** 2) ** 0.5
        return np.float32([[0, 0], [a, 0], [0, b], [c, d]])

    def __crop_image(self, img: Image, bboxes: list[np.ndarray]) -> list:
        result = []
        logger.info(f'cropping file {img.filename}')
        for array in tqdm(bboxes):
            init_concat_coords = array.astype(np.float32)
            init_concat_coords[[2, 3], :] = init_concat_coords[[3, 2], :]
            processed_concat_coords = self.__get_right_points(
                init_concat_coords
            )
            perspective_matrix = cv.getPerspectiveTransform(
                init_concat_coords,
                processed_concat_coords
            )
            result.append(
                cv.warpPerspective(
                    np.array(img),
                    perspective_matrix,
                    tuple(map(int, processed_concat_coords[3]))
                )
            )
        return result

# if __name__ == '__main__':
#     proc = ImageProcessor('./MLCore/weights/craft_mlt_25k.pth')
#     img = Image.open('/home/windowskonon1337/sources/CRAFT-pytorch/test_folder/20220309_163524.JPG')
#     bboxes = proc.get_text_bboxes(img)
#     print(
#         proc.get_string_from_crops(
#             proc.crop_image(img, bboxes)
#         )
#     )