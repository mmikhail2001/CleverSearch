from abc import ABC, abstractmethod


class IDataProcessor(ABC):
    @abstractmethod
    def process():
        pass
