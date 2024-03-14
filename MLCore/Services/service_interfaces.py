from abc import ABC, abstractmethod


class IService(ABC):
    pass

class IDataService(IService, ABC):
    @abstractmethod
    def update_collection_file(self, data):
        pass
