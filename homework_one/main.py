import argparse
import os
from homework_one.filter_one.filter_one_main import run_filter_one
from homework_one.filter_three.filter_three_main import run_filter_three
from homework_one.database.setup_database import get_database, initialize_collections
import time
from datetime import datetime


def main():
    initialize_collections()

    db = get_database()
    if db.issuers.find_one() is None:
        run_filter_one()

    run_filter_three()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--format", required=True, type=int)
    args = parser.parse_args()
    os.environ['FORMAT_DATA'] = str(args.format)

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