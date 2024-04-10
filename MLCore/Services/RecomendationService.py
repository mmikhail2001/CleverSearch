import requests
from fastapi import FastAPI, HTTPException
from sklearn.metrics.pairwise import cosine_similarity
from Processors.TextProcessor import TextProcessor
import sys
import logging

sys.path.insert(0, './MLCore/')
sys.path.insert(1, './MLCore/utils')
from utils.get_console_logger import get_console_logger

logger = get_console_logger(
    __name__,
    logging.INFO
)

app = FastAPI()

class SearchService():
    def __init__(self):
        pass

    def search_handler(self, params, **kwargs):

        data_array = self.get_data_array(params)

        text_processor = TextProcessor()
        query_emb = [text_processor.process_query_string(kwargs['query'])]

        list_embs = [[obj['ml_data'][0]['Value']] for obj in data_array]

        dists = []

        for i in range(len(list_embs)):
            for j in range(len(list_embs[i][0])):
                dists.append(
                    (i, j, cosine_similarity([list_embs[i][0][j]], query_emb))
                )
        logger.info(dists)
        sorted_list = sorted(dists, key=lambda x: x[2], reverse=True)[:5]

        if params['file_type'] == 'audio' or params['file_type'] == 'video':
            return self.find_audio_files(data_array, sorted_list, params['file_type'])
        elif params['file_type'] == 'text':
            return self.find_text_files(data_array, sorted_list, params['file_type'])
        elif params['file_type'] == 'img':
            pass
        else:
            raise HTTPException(status_code=400, detail=f"bad file type")

    def get_data_array(self, params):
        response = requests.get("http://backend:8080/api/ml/files", params=params)

        if response.status_code != 200:
            print("Error /api/ml/files:", response.status_code)
            raise HTTPException(status_code=500, detail=f"Error /api/ml/files: {response.status_code}, body: {response.text}")

        response_data = response.json()
        data_array = response_data.get('body', [])
        if len(data_array) == 0:
            raise HTTPException(status_code=400, detail=f"Files not found")
        
        return data_array

    def find_text_files(self, data_array, sorted_list, file_type):
        result = {}
        for elem in sorted_list:
            if elem[0] not in result:
                result[elem[0]] = elem[1]
        files_uuid = [
            {
                "file_uuid": data_array[k]['id'],
                'page_number': data_array[k]['ml_data'][1]['Value'][result[k]]
            } for k in list(result.keys())]
        return {file_type: files_uuid}

    def find_audio_files(self, data_array, sorted_list, file_type):
        result = {}
        for elem in sorted_list:
            if elem[0] not in result:
                result[elem[0]] = elem[1]
        files_uuid = [
            {
                "file_uuid": data_array[k]['id'],
                'timestamp': data_array[k]['ml_data'][1]['Value'][result[k]]
            } for k in list(result.keys())]
        return {file_type: files_uuid}


def setup_search_handler(args):
    search_service = SearchService()
    @app.get('/search')
    def search(query, file_type, user_id, dir, disk, number_of_results=5):
        
        params = {
            'file_type': file_type,
            'status': "processed",
            'dir': "/",
            'user_id': user_id
        }

        return search_service.search_handler(params, query=query)
    return search
