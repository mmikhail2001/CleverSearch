import torch
import numpy as np
from IDataProcessor import IDataProcessor
from pytesseract import image_to_string
from PIL import Image
from collections import OrderedDict
import sys
from easyocr import Reader
sys.path.insert(1, './MLCore/')
sys.path.insert(2, './MLCore/CRAFT')
from CRAFT.craft import CRAFT
from CRAFT.test import test_net


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

        print('success!')


    def process(self, img: Image)->str:
        bboxes = self.__get_text_bboxes(img)
        img_crops = self.__crop_image(img, bboxes)
        string = self.__get_string_from_crops(img_crops).lower()
        return string
    
    def __get_string_from_crops(self, crops: list)->str:
        result = []
        for crop in crops:
            word = self.reader.readtext(np.array(crop), detail=False)
            if len(word):
                result.append(
                    *word
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
    processor = ImageProcessor('./MLCore/CRAFT/craft_mlt_25k.pth')

    img = Image.open('./hwt_rus.jpg')
    print(processor.process(img))
