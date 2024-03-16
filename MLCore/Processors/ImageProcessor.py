import torch
import logging
import numpy as np
from IDataProcessor import IDataProcessor
from PIL import Image
from collections import OrderedDict
import sys
from easyocr import Reader
sys.path.insert(1, '/')
sys.path.insert(2, '/CRAFT/')
from CRAFT.craft import CRAFT
from CRAFT.test import test_net


logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.DEBUG)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
console_handler.setFormatter(formatter)

logger.addHandler(console_handler)



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

        logger.info('Image Processor started')


    def process(self, img: Image)->str:
        try:
            bboxes = self.__get_text_bboxes(img)
            if not len(bboxes):
                logger.warning(f'{img.filename}: >> text not found')
            img_crops = self.__crop_image(img, bboxes)
            string = self.__get_string_from_crops(img_crops).lower()
            return string
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


if __name__ == '__main__':
    img = Image.open('/home/windowskonon1337/Pictures/steve_huis.jpg')

    print(img.filename)