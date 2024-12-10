from backend.app.filters.filter_one.bonds_extractor import get_bond_symbols
from backend.database.setup_database import get_database
from backend.app.filters.filter_one.issuers_dropdown_scraper import scrape_issuers_dropdown


async def run_filter_one():
    db = get_database()

    if "issuers" not in db.list_collection_names():
        db.create_collection("issuers", capped=False)

    issuer_symbols = await scrape_issuers_dropdown()
    bonds_symbols = await get_bond_symbols()

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
                              "valid": is_valid,
                              "last_scraped_date": "1/1/1995"}},
            upsert=True
        )

    return "Successfully executed filter one!"