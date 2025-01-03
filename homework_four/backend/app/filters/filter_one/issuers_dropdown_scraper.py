import requests
from bs4 import BeautifulSoup

ISSUERS_LIST_URL = 'https://www.mse.mk/en/stats/symbolhistory/ADIN'


def scrape_issuers_dropdown():
    response = requests.get(ISSUERS_LIST_URL)
    response.raise_for_status()
    soup = BeautifulSoup(response.content, 'html.parser')

    dropdown = soup.find('select', {'id': 'Code'})
    issuer_symbols = [option.get('value').strip() for option in dropdown.find_all('option') if
                      option.get('value').strip()]

    return issuer_symbols