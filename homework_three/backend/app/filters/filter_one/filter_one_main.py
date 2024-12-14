from backend.app.filters.filter_one.bonds_extractor import get_bond_symbols
from backend.database.setup_database import get_database
from backend.app.filters.filter_one.issuers_dropdown_scraper import scrape_issuers_dropdown

def run_filter_one():
    db = get_database()
    issuer_symbols = scrape_issuers_dropdown()
    bonds_symbols = get_bond_symbols()

    for symbol in issuer_symbols:
        is_bond = symbol in bonds_symbols
        has_digit = any(char.isdigit() for char in symbol)
        if has_digit or is_bond:
            is_valid = False
        else:
            is_valid = True

        db.issuers.update_one(
            {"symbol": symbol},
            {"$setOnInsert": {"symbol": symbol,
                              "is_bond": is_bond,
                              "has_digit": has_digit,
                              "valid": is_valid}},
            upsert=True
        )

    return "Successfully executed filter one!"