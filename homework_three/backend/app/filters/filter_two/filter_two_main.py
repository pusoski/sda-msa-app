from backend.database.setup_database import get_database
import requests
from bs4 import BeautifulSoup
from collections import OrderedDict
from datetime import datetime
from backend.app.filters.filter_three.format_records import format_scraped_record

BASE_URL_TEMPLATE = "https://www.mse.mk/en/stats/symbolhistory/{}/?FromDate={}&ToDate={}"  # URL format


def scrape_data_for_issuer(symbol, scraping_date=None):
    db = get_database()
    now = datetime.now()
    today = f"{now.month}/{now.day}/{now.year}"

    data = []
    valid_years = 0

    most_recent_entries = list(db.data_entries.find({"symbol": symbol}))
    if most_recent_entries:
        most_recent_entries = sorted(
            most_recent_entries,
            key=lambda x: datetime.strptime(x["date"], "%m/%d/%Y"),
            reverse=True
        )
        most_recent_date = datetime.strptime(most_recent_entries[0]["date"], "%m/%d/%Y")
    else:
        most_recent_date = None

    if not scraping_date:
        scraping_date = f"1/1/{now.year}"

    formatted_scraping_date = datetime.strptime(scraping_date, "%m/%d/%Y")

    if most_recent_date and most_recent_date < formatted_scraping_date:
        start_date = most_recent_date.strftime("%m/%d/%Y")
    else:
        start_date = f"1/1/{formatted_scraping_date.year}"

    start_year = datetime.strptime(start_date, "%m/%d/%Y").year

    for year in range(start_year, 1994, -1):
        if valid_years >= 10:
            break

        year_start_date = start_date if year == start_year else f"1/1/{year}"
        year_end_date = f"12/31/{year}"

        url = BASE_URL_TEMPLATE.format(symbol, year_start_date, year_end_date)
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

    unique_data = {f"{record['symbol']}_{record['date']}": record for record in data}
    deduplicated_data = list(unique_data.values())

    for record in deduplicated_data:
        db.data_entries.update_one(
            {"symbol": record["symbol"], "date": record["date"]},
            {"$set": record},
            upsert=True
        )

    db.issuers.update_one(
        {"symbol": symbol},
        {"$set": {"last_scraped_date": today}},
        upsert=False
    )

def get_last_scraped_date(symbol):
    db = get_database()
    issuer = db.issuers.find_one({"symbol": symbol})
    return issuer.get("last_scraped_date")