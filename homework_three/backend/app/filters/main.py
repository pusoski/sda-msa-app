from backend.app.filters.filter_one.filter_one_main import run_filter_one
from backend.app.filters.filter_three.filter_three_main import run_filter_three
from backend.database.setup_database import get_database
import time
from datetime import datetime


def main():
    db = get_database()

    if "issuers" not in db.list_collection_names():
        db.create_collection("issuers", capped=False)

    if "data_entries" not in db.list_collection_names():
        db.create_collection("data_entries", capped=False)

    if "scrapings" not in db.list_collection_names():
        db.create_collection("scrapings", capped=False)

    run_filter_one()

    run_filter_three()

if __name__ == "__main__":
    start_time = time.time()
    main()
    elapsed_time = (time.time() - start_time) / 60
    now = datetime.now()
    today = f"{now.month}/{now.day}/{now.year}"

    db = get_database()
    db.scrapings.insert_one({
        "scraping_date": today,
        "elapsed_time_minutes": elapsed_time,
    })

    existing_indexes = db.issuers.index_information()
    if 'valid_1' not in existing_indexes:
        db.issuers.create_index([('valid', 1)], name='valid_1')
    if 'symbol_1' not in existing_indexes:
        db.issuers.create_index([('symbol', 1)], name='symbol_1')

    existing_indexes = db.data_entries.index_information()
    if 'symbol_1' not in existing_indexes:
        db.data_entries.create_index([('symbol', 1)], name='symbol_1')
    if 'date_1' not in existing_indexes:
        db.data_entries.create_index([('date', 1)], name='date_1')