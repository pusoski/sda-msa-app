# Macedonian Stock Analyzer

An application that provides a platform for investors and analysts to analyze historical data for stocks on the Macedonian Stock Exchange, allowing users to have daily access to stock market data covering the last 10 years. User will be able to track performance trends, compare companize, visualize data, and generate insights to support their financial decisions. Project for the course Software Design and Architecture at FCSE Skopje.

The application sources its information from: https://www.mse.mk/en. 

Contributors (The students working on this project):
- Hristijan Pusoski, Index: 221524
- Iskra Stojchevska, Index: 221535
- Irinej Ilievski, Index: 211554

## Running the Application (Homework One)

### 1. Clone the Repository
> Requires a Git installation to be present on the system.
```bash
git clone https://github.com/pusoski/sda-mse.git
cd sda-mse
```

### 2. Run Through Docker / Docker Compose
> Requires a Docker installation to be present on the system.
```bash
docker-compose up --build
```

## Note About the Dockerized Application

Once run using Docker / Docker Compose, the application stores the data in a volume for MongoDB, and the data can be accessed using software like DataGrip, or PyCharm's built-in database functionality, without authentication, on port 27017 (see [docker-compose.yml](https://github.com/pusoski/sda-mse/blob/main/docker-compose.yml)).

To insert data with unformatted prices (English, original format), in [docker-compose.yml](https://github.com/pusoski/sda-mse/blob/main/docker-compose.yml) change the format argument value to 0 (in the last line of the file). Otherwise, to use the Macedonian format of the prices, keep the file as it is (--format=1).
