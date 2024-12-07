import asyncio
import aiohttp
from aiohttp import ClientSession
from backend.database.setup_database import get_database
from bs4 import BeautifulSoup
from collections import OrderedDict
from datetime import datetime
from backend.app.filters.filter_three.format_records import format_scraped_record
import os

BASE_URL_TEMPLATE = "https://www.mse.mk/en/stats/symbolhistory/{}/?FromDate={}&ToDate={}"


async def fetch(session: ClientSession, url: str) -> str:
    async with session.get(url) as response:
        response.raise_for_status()
        return await response.text()


async def process_year(session: ClientSession, semaphore: asyncio.Semaphore, symbol: str, year: int, format_data: int) -> list:
    async with semaphore:
        url = BASE_URL_TEMPLATE.format(symbol, f"1/1/{year}", f"12/31/{year}")
        try:
            html_content = await fetch(session, url)
        except Exception as e:
            print(f"Failed to fetch data for year {year}: {e}")
            return []

        soup = BeautifulSoup(html_content, 'lxml')

        if soup.find('div', class_='col-md-12', string="No data"):
            return []

        table = soup.find('table')
        if not table:
            return []

        headers = [th.text.strip() for th in table.find_all('th')]
        data = []

        for row in table.find_all('tr')[1:]:
            cells = row.find_all('td')
            if len(cells) != len(headers):
                continue
            record = OrderedDict((headers[i], cells[i].text.strip()) for i in range(len(headers)))
            if format_data == 1:
                format_scraped_record(record)
            record['symbol'] = symbol
            data.append(record)

        return data


async def scrape_data_for_issuer(symbol: str, scraping_date: str = None):
    db = get_database()
    now = datetime.now()
    today = f"{now.month}/{now.day}/{now.year}"

    if not scraping_date:
        scraping_date = f"1/1/{now.year}"

    data = []
    valid_years = 0

    if scraping_date != f"1/1/{now.year}":
        try:
            formatted_scraping_date = datetime.strptime(scraping_date, "%m/%d/%Y")
        except ValueError:
            print("Invalid scraping_date format. Expected MM/DD/YYYY.")
            return
    else:
        formatted_scraping_date = None

    if not formatted_scraping_date:
        years = list(range(now.year, 1994, -1))
        semaphore = asyncio.Semaphore(int(os.environ.get('CONCURRENT_REQUESTS', '20')))
        format_data = int(os.environ.get('FORMAT_DATA', '0'))

        async with aiohttp.ClientSession() as session:
            for year in years:
                year_data = await process_year(session, semaphore, symbol, year, format_data)
                if year_data:
                    data.extend(year_data)
                    valid_years += 1
                    if valid_years >= 10:
                        break

    if data:
        db.data_entries.insert_many(data)

        db.issuers.update_one(
            {"symbol": symbol},
            {"$set": {"last_scraped_date": today}},
            upsert=False
        )
    else:
        db.issuers.update_one(
            {"symbol": symbol},
            {"$set": {"last_scraped_date": "1/1/1995"}},
            upsert=False
        )


def get_last_scraped_date(symbol: str) -> str:
    db = get_database()
    issuer = db.issuers.find_one({"symbol": symbol})
    return issuer.get("last_scraped_date") if issuer else None