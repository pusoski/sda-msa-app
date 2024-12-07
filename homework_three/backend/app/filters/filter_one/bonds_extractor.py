import asyncio
import aiohttp
from aiohttp import ClientSession
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import os

BASE_URL = 'https://www.mse.mk/'
BONDS_LIST_URL = 'https://www.mse.mk/en/issuers/bonds'


async def fetch(session: ClientSession, url: str) -> str:
    async with session.get(url) as response:
        response.raise_for_status()
        return await response.text()


async def get_bond_urls(session: ClientSession, semaphore: asyncio.Semaphore) -> list:
    async with semaphore:
        try:
            html_content = await fetch(session, BONDS_LIST_URL)
        except Exception as e:
            print(f"Failed to fetch bonds list page: {e}")
            return []

    soup = BeautifulSoup(html_content, 'lxml')
    bond_table = soup.find('table', {'id': 'bonds-table'})

    if bond_table is None:
        print("Error: Bond table not found on the page.")
        return []

    bond_urls = []
    for row in bond_table.find_all('tr')[1:]:
        cells = row.find_all('td')
        if len(cells) > 1:
            link_tag = cells[1].find('a')
            if link_tag and 'href' in link_tag.attrs:
                bond_url = urljoin(BASE_URL, link_tag['href'])
                bond_urls.append(bond_url)

    return bond_urls


async def get_historical_data_url(session: ClientSession, semaphore: asyncio.Semaphore, bond_url: str) -> None | str | \
                                                                                                          list[str]:
    async with semaphore:
        try:
            html_content = await fetch(session, bond_url)
        except Exception as e:
            print(f"Failed to fetch bond page {bond_url}: {e}")
            return None

    soup = BeautifulSoup(html_content, 'lxml')
    historical_data_link = soup.find('a', string="Historical Data")
    if historical_data_link and 'href' in historical_data_link.attrs:
        historical_data_url = historical_data_link['href']
        return historical_data_url
    else:
        print(f"Historical Data link not found for bond URL: {bond_url}")
        return None


async def extract_symbol(historical_data_url: str) -> str | None:
    if historical_data_url:
        path = urlparse(historical_data_url).path
        symbol = path.strip('/').split('/')[-1]
        return symbol
    return None


async def get_bond_symbols() -> list:
    bond_symbols = []
    semaphore = asyncio.Semaphore(int(os.environ.get('CONCURRENT_REQUESTS', '20')))

    async with aiohttp.ClientSession() as session:
        bond_urls = await get_bond_urls(session, semaphore)
        if not bond_urls:
            print("No bond URLs found.")
            return bond_symbols

        tasks = [
            get_historical_data_url(session, semaphore, bond_url)
            for bond_url in bond_urls
        ]
        historical_data_urls = await asyncio.gather(*tasks)

        symbol_tasks = [
            extract_symbol(url) for url in historical_data_urls if url
        ]
        symbols = await asyncio.gather(*symbol_tasks)

        bond_symbols = [symbol for symbol in symbols if symbol]

    return bond_symbols