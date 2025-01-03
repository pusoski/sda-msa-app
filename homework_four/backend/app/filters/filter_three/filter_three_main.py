from backend.database.setup_database import get_database
from backend.app.filters.filter_two.filter_two_main import scrape_data_for_issuer, get_last_scraped_date


def run_filter_three():
    db = get_database()
    issuers = db.issuers.find({"valid": True})

    for issuer in issuers:
        symbol = issuer["symbol"]
        scraping_date = get_last_scraped_date(symbol)
        scrape_data_for_issuer(symbol, scraping_date)