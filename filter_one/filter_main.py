import asyncio
from filter_one.bonds_extractor import get_bond_urls
from filter_one.issuers_extractor import get_valid_issuer_symbols

def valid_issuers_filter():
    bond_urls = get_bond_urls()
    valid_issuers = asyncio.run(get_valid_issuer_symbols(bond_urls))
    return valid_issuers