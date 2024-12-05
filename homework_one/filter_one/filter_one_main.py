from homework_one.filter_one.bonds_extractor import get_bond_symbols
from homework_one.database.setup_database import get_database
from homework_one.filter_one.issuers_dropdown_scraper import scrape_issuers_dropdown


def run_filter_one():
    db = get_database()
    issuer_symbols = scrape_issuers_dropdown()
    bonds_symbols = get_bond_symbols()

    for symbol in issuer_symbols:
        if any(char.isdigit() for char in symbol):
            is_valid_symbol = False
        elif symbol in bonds_symbols:
            is_valid_symbol = False
        else:
            is_valid_symbol = True
        db.issuers.update_one(
            {"symbol": symbol},
            {"$setOnInsert": {"symbol": symbol, "valid": is_valid_symbol}},
            upsert=True
        )