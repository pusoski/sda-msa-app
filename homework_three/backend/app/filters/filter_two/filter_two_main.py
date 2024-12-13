from backend.database.setup_database import get_database
import requests
from bs4 import BeautifulSoup
from collections import OrderedDict
from datetime import datetime
from backend.app.filters.filter_three.format_records import format_scraped_record

BASE_URL_TEMPLATE = "https://www.mse.mk/en/stats/symbolhistory/{}/?FromDate={}&ToDate={}"


def scrape_data_for_issuer(symbol, scraping_date=None):
    db = get_database()
    now = datetime.now()
    today = f"{now.month}/{now.day}/{now.year}"

    if not scraping_date:
        scraping_date = f"1/1/{now.year}"

    data = []
    valid_years = 0

    if scraping_date != f"1/1/{now.year}":
        formatted_scraping_date = datetime.strptime(scraping_date, "%m/%d/%Y")
    else:
        formatted_scraping_date = None

    if not formatted_scraping_date:
        for year in range(now.year, 1994, -1):
            if valid_years >= 10:
                break

            url = BASE_URL_TEMPLATE.format(symbol, f"1/1/{year}", f"12/31/{year}")
            response = requests.get(url)
            soup = BeautifulSoup(response.content, 'html.parser')

            if soup.find('div', class_='col-md-12', string="No data"):
                continue

            table = soup.find('table')
            if table:
                headers = [th.text.strip()
                           .replace(' ', '_')
                           .replace('%', 'pct')
                           .lower()
                           .replace('.', '')
                           for th in table.find_all('th')]
                for row in table.find_all('tr')[1:]:
                    cells = row.find_all('td')
                    if len(cells) == len(headers):
                        record = OrderedDict((headers[i], cells[i].text.strip()) for i in range(len(headers)))
                        format_scraped_record(record)
                        record['symbol'] = symbol
                        data.append(record)
                valid_years += 1

    if data:
        db.data_entries.insert_many(data)

        db.issuers.update_one(
            {"symbol": symbol},
            {"$set": {"last_scraped_date": today}},
            upsert=False
        )


def get_last_scraped_date(symbol):
    db = get_database()
    issuer = db.issuers.find_one({"symbol": symbol})
    found_last_scraped_date = issuer.get("last_scraped_date")

    return found_last_scraped_date