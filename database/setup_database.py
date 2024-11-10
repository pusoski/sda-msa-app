from pymongo import MongoClient


def get_database():
    client = MongoClient("mongodb://mongo:27017/")
    return client['issuers-data']


def initialize_collections():
    db = get_database()
    if "issuers" not in db.list_collection_names():
        db.create_collection("issuers", capped=False)
    if "data_entries" not in db.list_collection_names():
        db.create_collection("data_entries", capped=False)
    if "scrapings" not in db.list_collection_names():
        db.create_collection("scrapings", capped=False)