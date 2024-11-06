import re
import requests
from bs4 import BeautifulSoup
from bonds_extractor import extract_bond_symbols

# Constants
ISSUERS_LIST_URL = 'https://www.mse.mk/en/stats/symbolhistory/ADIN'


def fetch_all_issuer_symbols():
    """
    Fetches all issuer symbols from the dropdown on the issuers list page.

    Returns:
        list: A list of issuer symbols.
    """
    response = requests.get(ISSUERS_LIST_URL)
    response.raise_for_status()
    soup = BeautifulSoup(response.content, 'html.parser')

    dropdown = soup.find('select', {'id': 'Code'})
    issuer_symbols = []
    for option in dropdown.find_all('option'):
        symbol = option.get('value', '').strip()
        if symbol:
            issuer_symbols.append(symbol)

    return issuer_symbols


async def get_valid_issuer_symbols(bond_urls, concurrency_limit=10):
    """
    Filters valid issuer symbols by removing those that contain digits or match bond symbols.

    Parameters:
        bond_urls (list): List of bond URLs to check.
        concurrency_limit (int): Maximum number of concurrent requests.

    Returns:
        list: A list of valid issuer symbols.
    """
    issuer_symbols = fetch_all_issuer_symbols()
    bonds_symbols = await extract_bond_symbols(bond_urls, concurrency_limit)

    valid_issuer_symbols = []
    for symbol in issuer_symbols:
        contains_digit = bool(re.search(r'\d', symbol))
        is_bond_symbol = symbol in bonds_symbols

        # Only add symbols that are not bonds and do not contain digits
        if not contains_digit and not is_bond_symbol:
            valid_issuer_symbols.append(symbol)

    return valid_issuer_symbols