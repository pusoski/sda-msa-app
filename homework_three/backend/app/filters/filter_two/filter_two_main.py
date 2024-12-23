from backend.database.setup_database import get_database
import requests
from bs4 import BeautifulSoup
from collections import OrderedDict
from datetime import datetime
from backend.app.filters.filter_three.format_records import format_scraped_record
import pymongo

BASE_URL_TEMPLATE = "https://www.mse.mk/en/stats/symbolhistory/{}/?FromDate={}&ToDate={}"


def get_last_scraped_date(symbol):
    db = get_database()

    result = db.data_entries.find_one(
        {"symbol": symbol},
        sort=[("date", -1)],
        projection={"date": 1}
    )
    return result.get("date") if result else None


def scrape_data_for_issuer(symbol, scraping_date=None):
    db = get_database()

    system_date = f"{datetime.now().month}/{datetime.now().day}/{datetime.now().year}"
    system_date_formatted = datetime.strptime(system_date, "%m/%d/%Y").strftime("%Y-%m-%d")

    data = []
    valid_years = 0

    if not scraping_date:
        scraping_date = f"1/1/{datetime.now().year}"
        end_year = 1994
        start_year = datetime.strptime(scraping_date, "%m/%d/%Y").year
    else:
        start_year = datetime.strptime(scraping_date, "%Y-%m-%d").year
        end_year = start_year - 1
        scraping_date = datetime.strptime(scraping_date, "%Y-%m-%d").strftime("%m/%d/%Y")

    for year in range(start_year, end_year, -1):
        if valid_years >= 10:
            break

        if scraping_date == system_date:
            year_start_date = system_date
            year_end_date = system_date
        elif year == start_year:
            year_start_date = scraping_date
            year_end_date = f"12/31/{year}"
        else:
            year_start_date = f"1/1/{year}"
            year_end_date = f"12/31/{year}"

        # if year == start_year:
        #     year_start_date = scraping_date
        # else:
        #     year_start_date = f"1/1/{year}"
        # year_end_date = f"12/31/{year}"


        url = BASE_URL_TEMPLATE.format(symbol, year_start_date, year_end_date)

        response = requests.get(url)
        response.raise_for_status()

        soup = BeautifulSoup(response.content, 'html.parser')

        no_data_div = soup.find('div', class_='col-md-12')
        if no_data_div and "No data" in no_data_div.get_text():
            continue

        table = soup.find('table')
        if not table:
            continue

        headers = [
            th.get_text(strip=True)
            .replace(' ', '_')
            .replace('%', 'pct')
            .lower()
            .replace('.', '')
            for th in table.find_all('th')
        ]

        for row in table.find_all('tr')[1:]:
            cells = row.find_all('td')
            if len(cells) != len(headers):
                continue
            record = OrderedDict()
            for header, cell in zip(headers, cells):
                record[header] = cell.get_text(strip=True)
            format_scraped_record(record)
            record['symbol'] = symbol
            record['date'] = record.get('date', system_date_formatted)
            record['date'] = datetime.strptime(record['date'], "%m/%d/%Y").strftime("%Y-%m-%d")
            data.append(record)

        valid_years += 1

    bulk_operations = [
        pymongo.UpdateOne(
            {"symbol": record["symbol"], "date": record["date"]},
            {"$set": record},
            upsert=True
        )
        for record in data
    ]

    if bulk_operations:
        db.data_entries.bulk_write(bulk_operations)

    db.issuers.update_one(
        {"symbol": symbol},
        {"$set": {"last_scraped_date": system_date_formatted}},
        upsert=True
    )