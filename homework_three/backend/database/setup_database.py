import pymongo
import json
from bson import ObjectId


def get_database():
    client = pymongo.MongoClient("mongodb://mongo:27017/")
    return client['mse_data']


def setup_collections():
    db = get_database()

    if "issuers" not in db.list_collection_names():
        db.create_collection("issuers", capped=False)

    if "data_entries" not in db.list_collection_names():
        db.create_collection("data_entries", capped=False)
        insert_pre_scraped_data()

    if "scrapings" not in db.list_collection_names():
        db.create_collection("scrapings", capped=False)

    if "app_status" not in db.list_collection_names():
        db.create_collection("app_status", capped=False)

    if "reports" not in db.list_collection_names():
        db.create_collection("reports", capped=False)

    if "personalization" not in db.list_collection_names():
        db.create_collection("personalization", capped=False)

    if "personalization_strategies" not in db.list_collection_names():
        db.create_collection("personalization_strategies", capped=False)


def convert_oid(data):
    if isinstance(data, list):
        for doc in data:
            if "_id" in doc and isinstance(doc["_id"], dict) and "$oid" in doc["_id"]:
                doc["_id"] = ObjectId(doc["_id"]["$oid"])
    return data


def insert_pre_scraped_data():
    db = get_database()
    collection = db["data_entries"]
    with open('/app/backend/database/data_entries.json', 'r', encoding='utf-8') as json_file:
        data = [json.loads(line) for line in json_file]
        data = convert_oid(data)

    try:
        result = collection.insert_many(data)
        print(f"Inserted {len(result.inserted_ids)} documents into the collection.")
    except pymongo.errors.BulkWriteError as e:
        print("Error inserting documents:", e.details)