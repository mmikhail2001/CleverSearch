import numpy as np
from fastapi import FastAPI
from pandas import DataFrame
from pymongo import MongoClient
from pymongo.collection import Collection
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

app = FastAPI()

def setup_search_handler(args):
    @app.get('/search')
    def search(query, file_type, user, dir, disk, number_of_results=5):

        client = MongoClient(f'mongodb://{args.mongo_addr}:{args.mongo_port}/')
        mongo_collection = client[args.mongo_DB_name][args.mongo_collection_name]

        q = {
            '$and': [
                {'user_id': user},
                {'content_type': file_type}
            ]
        }

        cursor = mongo_collection.find(q)

        list_cur = list(cursor)
        df = DataFrame(list_cur)

        txt_list = [list(val.values())[0] for val in df.ml_data]
        txt_list.append(query)

        vectorizer = TfidfVectorizer()
        X = vectorizer.fit_transform(txt_list).todense()

        cosine = [cosine_similarity(
            np.array(vec), np.array(X[-1])
            ) for vec in X[:-1]]

        tmp_dict = {index: value for index, value in enumerate(cosine)}
        sorted_dict = dict(sorted(
            tmp_dict.items(), key=lambda item: item[1], reverse=True
            ))

        keys = list(sorted_dict.keys())[:number_of_results]

        return df.iloc[keys]._id
    
    return search
