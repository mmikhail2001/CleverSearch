import numpy as np
from pandas import DataFrame
from pymongo.collection import Collection
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from fastapi import FastAPI

app = FastAPI()

class RecomendationService:
    def __init__(
            self,
            mongo_collection: Collection
    ):
        self.mongo_collection = mongo_collection

    @app.get('/search/{query}/{type}/{usr_id}')
    def search(self, user_id, doctype, search_query, number_of_results=5):

        query = {
            '$and': [
                {'user_id': user_id},
                {'content_type': doctype}
            ]
        }

        cursor = self.mongo_collection.find(query)

        list_cur = list(cursor)
        df = DataFrame(list_cur)

        txt_list = list(df.ml_data)
        txt_list.append(search_query)

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
