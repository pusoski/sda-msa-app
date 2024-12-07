import os
from pymongo import MongoClient


def get_database():
    # Fetch MongoDB credentials from environment variables
    mongo_user = os.getenv("MONGO_USER")
    mongo_password = os.getenv("MONGO_PASSWORD")
    mongo_host = os.getenv("MONGO_HOST", "mongo")  # Default to 'mongo' if not set
    mongo_port = os.getenv("MONGO_PORT", "27017")   # Default to '27017' if not set
    mongo_db = os.getenv("MONGO_DB", "mse_data")    # Default to 'mse_data' if not set

    # Construct MongoDB URI
    uri = f"mongodb://{mongo_user}:{mongo_password}@{mongo_host}:{mongo_port}/?authSource=admin"

    # Initialize MongoDB client
    client = MongoClient(uri)

    return client[mongo_db]
