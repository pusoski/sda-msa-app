from backend.app.filters.filter_one.filter_one_main import run_filter_one
from backend.app.filters.filter_three.filter_three_main import run_filter_three
from backend.database.setup_database import get_database, setup_collections

if __name__ == "__main__":
    db = get_database()

    db.app_status.update_one(
        {},
        {"$set": {"status": "unready", "details": "Setting up database"}},
        upsert=True)

    setup_collections()

    db.app_status.update_one(
        {},
        {"$set": {"status": "unready", "details": "Running pipeline"}},
        upsert=True)

    run_filter_one()

    run_filter_three()

    db.app_status.update_one(
        {},
        {"$set": {"status": "unready", "details": "Configuring database"}},
        upsert=True)

    existing_indexes_issuers = db.issuers.index_information()
    if 'valid_1' not in existing_indexes_issuers:
        db.issuers.create_index([('valid', 1)], name='valid_1')
    if 'symbol_1' not in existing_indexes_issuers:
        db.issuers.create_index([('symbol', 1)], name='symbol_1')
    if 'watched_1' not in existing_indexes_issuers:
        db.issuers.create_index([('is_watched', 1)], name='watched_1')

    existing_indexes_data_entries = db.data_entries.index_information()
    if 'symbol_1' not in existing_indexes_data_entries:
        db.data_entries.create_index([('symbol', 1)], name='symbol_1')
    if 'date_1' not in existing_indexes_data_entries:
        db.data_entries.create_index([('date', 1)], name='date_1')

    db.app_status.update_one(
        {},
        {"$set": {"status": "ready", "details": "Finishing up"}},
        upsert=True)