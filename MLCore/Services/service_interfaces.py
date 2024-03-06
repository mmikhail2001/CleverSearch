from abc import ABC, abstractmethod


class IService(ABC):
    pass

class IDataService(IService, ABC):
    @abstractmethod
    def insert_into_collection(self, data):
        pass
