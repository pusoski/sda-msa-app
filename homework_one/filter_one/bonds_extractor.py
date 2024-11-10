import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse

BASE_URL = 'https://www.mse.mk/'
BONDS_LIST_URL = 'https://www.mse.mk/en/issuers/bonds'


def get_bond_symbols():
    response = requests.get(BONDS_LIST_URL)
    response.raise_for_status()
    soup = BeautifulSoup(response.content, 'html.parser')
    bond_table = soup.find('table', {'id': 'bonds-table'})

    if bond_table is None:
        print("Error: Bond table not found on the page.")
    else:
        bond_urls = []
        for row in bond_table.find_all('tr')[1:]:
            cells = row.find_all('td')
            if len(cells) > 1:
                link_tag = cells[1].find('a')
                if link_tag and 'href' in link_tag.attrs:
                    bond_url = urljoin(BASE_URL, link_tag['href'])
                    bond_urls.append(bond_url)

        historical_data_urls = []

        for bond_url in bond_urls:
            bond_response = requests.get(bond_url)
            bond_response.raise_for_status()
            bond_soup = BeautifulSoup(bond_response.content, 'html.parser')

            historical_data_link = bond_soup.find('a', string="Historical Data")
            if historical_data_link and 'href' in historical_data_link.attrs:
                historical_data_url = historical_data_link['href']
                historical_data_urls.append(historical_data_url)

        bond_symbols = []

        for bond_historical_data_url in historical_data_urls:
            path = urlparse(bond_historical_data_url).path
            symbol = path.split('/')[-1]
            bond_symbols.append(symbol)

        return bond_symbols