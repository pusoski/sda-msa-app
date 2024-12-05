from homework_one.database.setup_database import get_database
from homework_one.filter_two.filter_two_main import scrape_data_for_issuer, get_last_scraped_date


def run_filter_three():
    db = get_database()
    issuers = db.issuers.find({"valid": True})

    for issuer in issuers:
        symbol = issuer["symbol"]
        scraping_date = get_last_scraped_date(symbol)
        scrape_data_for_issuer(symbol, scraping_date)