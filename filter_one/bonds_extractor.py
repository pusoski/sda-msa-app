import asyncio
import aiohttp
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
import re

# Constants
BASE_URL = 'https://www.mse.mk/'
BOND_LISTING_URL = 'https://www.mse.mk/en/issuers/bonds'


def get_bond_urls():
    """
    Extracts bond URLs from the bond listing page.

    Returns:
        list of str: Absolute URLs to each bond's page.
    """
    response = requests.get(BOND_LISTING_URL)
    response.raise_for_status()
    soup = BeautifulSoup(response.content, 'html.parser')

    # Locate the bond table and extract bond links
    bond_table = soup.find('table', {'id': 'bonds-table'})
    bond_urls = []
    for row in bond_table.find_all('tr')[1:]:  # Skip header row
        cells = row.find_all('td')
        if len(cells) > 1:
            link_tag = cells[1].find('a')
            if link_tag and 'href' in link_tag.attrs:
                bond_url = link_tag['href']
                bond_urls.append(urljoin(BASE_URL, bond_url))

    return bond_urls


async def get_bond_symbol(session, bond_url, semaphore):
    """
    Fetches the bond symbol from a bond page by looking for the historical data link.

    Parameters:
        session (aiohttp.ClientSession): The session for making HTTP requests.
        bond_url (str): The bond's URL.
        semaphore (asyncio.Semaphore): Semaphore for controlling concurrency.

    Returns:
        str or None: The bond symbol if found, otherwise None.
    """
    async with semaphore:
        try:
            async with session.get(bond_url) as response:
                response.raise_for_status()
                html = await response.text()
                soup = BeautifulSoup(html, 'html.parser')

                historical_data_link = soup.find('a', href=re.compile(r'/symbolhistory/'))
                if historical_data_link and 'href' in historical_data_link.attrs:
                    match = re.search(r'/symbolhistory/([A-Z0-9]+)', historical_data_link['href'])
                    if match:
                        return match.group(1)
        except Exception as e:
            print(f"Error processing {bond_url}: {e}")
    return None


async def extract_bond_symbols(bond_urls, concurrency_limit=10):
    """
    Extracts bond symbols from a list of bond URLs.

    Parameters:
        bond_urls (list): List of bond URLs.
        concurrency_limit (int): Maximum number of concurrent requests.

    Returns:
        set: A set of bond symbols.
    """
    semaphore = asyncio.Semaphore(concurrency_limit)
    async with aiohttp.ClientSession() as session:
        tasks = [get_bond_symbol(session, url, semaphore) for url in bond_urls]
        bond_symbols = await asyncio.gather(*tasks)
        return set(filter(None, bond_symbols))  # Remove None values