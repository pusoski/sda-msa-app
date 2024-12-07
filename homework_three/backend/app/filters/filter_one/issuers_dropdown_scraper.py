import asyncio
import aiohttp
from aiohttp import ClientSession
from bs4 import BeautifulSoup

TIMEOUT = 15
ISSUERS_LIST_URL = 'https://www.mse.mk/en/stats/symbolhistory/ADIN'


async def fetch(session: ClientSession, url: str) -> str:
    async with session.get(url) as response:
        response.raise_for_status()
        return await response.text()


async def scrape_issuers_dropdown() -> list:
    issuer_symbols = []
    timeout = aiohttp.ClientTimeout(total=TIMEOUT)

    async with aiohttp.ClientSession(timeout=timeout) as session:
        try:
            html_content = await fetch(session, ISSUERS_LIST_URL)
        except aiohttp.ClientResponseError as e:
            print(f"HTTP error occurred while fetching {ISSUERS_LIST_URL}: {e}")
            return issuer_symbols
        except aiohttp.ClientError as e:
            print(f"Network error occurred while fetching {ISSUERS_LIST_URL}: {e}")
            return issuer_symbols
        except asyncio.TimeoutError:
            print(f"Request to {ISSUERS_LIST_URL} timed out.")
            return issuer_symbols

        soup = BeautifulSoup(html_content, 'lxml')

        dropdown = soup.find('select', {'id': 'Code'})
        if dropdown is None:
            print("Error: Dropdown with id 'Code' not found on the page.")
            return issuer_symbols

        issuer_symbols = [
            option.get('value').strip()
            for option in dropdown.find_all('option')
            if option.get('value') and option.get('value').strip()
        ]

    return issuer_symbols