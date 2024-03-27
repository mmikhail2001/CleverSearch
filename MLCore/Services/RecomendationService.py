import numpy as np
import pandas as pd
import requests
from fastapi import FastAPI, HTTPException
from pandas import DataFrame
from pymongo import MongoClient
from pymongo.collection import Collection
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

def setup_search_handler(args):
    @app.get('/search')
    def search(query, file_type, user_id, dir, disk, number_of_results=5):
        params = {
            'file_type': file_type,
            'status': "processed",
            'dir': "/",
            'user_id': user_id
        }

        response = requests.get("http://backend:8080/api/ml/files", params=params)

        if response.status_code != 200:
            print("Error /api/ml/files:", response.status_code)
            raise HTTPException(status_code=500, detail=f"Error /api/ml/files: {response.status_code}, body: {response.text}")

        response_data = response.json()
        data_array = response_data.get('body', [])
        if len(data_array) == 0:
            raise HTTPException(status_code=400, detail=f"Files not found")
        
        list_embs = [[obj['ml_data'][0]['Value']] for obj in data_array]

        logger.info(len(list_embs), len(list_embs[0]), len(list_embs[0][0][0]))

        text_processor = TextProcessor()
        query_emb = [text_processor.process_query_string(query)]
        
        dists = []

        for i in range(len(list_embs)):
            for j in range(len(list_embs[i][0])):
                dists.append(
                    (i, j, cosine_similarity([list_embs[i][0][j]], query_emb))
                )
        logger.info(dists)
        sorted_list = sorted(dists, key=lambda x: x[2], reverse=True)[:number_of_results]
        file_keys = sorted(set(map(lambda x: x[0], sorted_list)), key=list(map(lambda x: x[0], sorted_list)).index)
        files_uuid = [{"index": k, "file_uuid": data_array[k]['id']} for k in file_keys]
        return {"files": files_uuid}

    return search
