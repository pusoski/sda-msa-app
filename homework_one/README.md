# Homework One

The application sources its information from the [Macedonian Stock Exchange website](https://www.mse.mk/en) (English
version).

## Software Requirements Specification & Pre-Scraped Data

The Software Requirements Specification (initial version) can be found in the [SRS file](./SRS.md).

### Pre-Scraped Issuers/Symbols

The list of issuers (up to 11/14/2024), along with their validity for the purposes of the application (as described
[here](../docs/homework_one_desc.pdf)), is available in [this file](./pre_scraped_data/11-14-2024-Issuers.csv).

### Pre-Scraped Data with Macedonian Price Formatting

The scraping of the data **with Macedonian price formatting** took ``24.94 minutes`` (executed on a local machine).
The scraped data exported from the database is available in [this file](./pre_scraped_data/11-14-2024-MacedonianPriceFormatting.csv).

![image info](https://i.ibb.co/RS9cSC2/image.png)

### Pre-Scraped Data with English Price Formatting

The scraped data exported from the database **with English price formatting** is available in [this file](./pre_scraped_data/11-14-2024-EnglishPriceFormatting.csv).

## Steps for Running the Application

### 1. Clone the Repository

> Requires a Git installation to be present on the system.

```bash
git clone https://github.com/pusoski/sda-msa-app.git

cd sda-msa-app/homework_one/
```

### 2. Run Through Docker / Docker Compose

> Requires a Docker installation to be present on the system.

```bash
docker-compose up --build
```

## Note About the Dockerized Application - Where to Find the Data...

Once run using Docker / Docker Compose, the application (Homework One) stores the data in a volume for MongoDB. The data
can then be accessed using software like JetBrains DataGrip or PyCharm's built-in database functionalities, **without
authentication on localhost:27017** (see [docker-compose.yml](../docker-compose.yml)).

![image info](https://i.ibb.co/JnvSZt6/image.png)

To insert data into the database with **unformatted prices** (English, original format), before building the app (Step
2), change the format argument value to 0 in the [Dockerfile](../Dockerfile) (last line), i.e.

```dockerfile
CMD ["python", "main.py", "--format=0"]
```

Otherwise, to use the **Macedonian format** of the prices, keep the format argument value as it is (`--format=1`).

If decided to go from `--format=1` to `--format=0`, or vice versa, please ensure that you have exported the scraped
records, and that the Docker image of the app and the volume for the database have been deleted (ensure that you have a
clean environment), before building the app again.
