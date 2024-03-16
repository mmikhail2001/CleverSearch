import numpy as np
from fastapi import FastAPI
from pandas import DataFrame
from pymongo import MongoClient
from pymongo.collection import Collection
from sklearn.metrics.pairwise import cosine_similarity
from Processors.TextProcessor import TextProcessor

app = FastAPI()

def setup_search_handler(args):
    @app.get('/search')
    def search(query, file_type, user_id, dir, disk, number_of_results=5):
        client = MongoClient(f'mongodb://{args.mongo_addr}:{args.mongo_port}/')
        mongo_collection = client[args.mongo_DB_name][args.mongo_collection_name]

        q = {
            '$and': [
                {'user_id': user_id},
                {'file_type': file_type},
                {'status': "processed"},
            ]
        }

        cursor = mongo_collection.find(q)
        list_cur = list(cursor)

        df = DataFrame(list_cur)

        print(df)

        list_embs = [list(val.values())[0] for val in df.ml_data]

        text_processor = TextProcessor
        query_emb = text_processor.process_query_string(query)
        
        dists = []

        for i in range(len(list_embs)):
            for j in range(len(list_embs[i])):
                dists.append(
                    (i, j, cosine_similarity(list_embs[i][j], query_emb))
                )
        sorted_list = sorted(dists, key=lambda x: x[2], reverse=True)[:number_of_results]
        file_keys = list(map(lambda x: x[0], sorted_list))

        files_uuid = [{"index": k, "file_uuid": df.iloc[k]._id} for k in file_keys]
        return {"files": files_uuid}
        # return {"files": files_uuid, "sentences": sentences}

    return search
