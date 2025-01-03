# Third Homework

The application sources its information from the [Macedonian Stock Exchange website](https://www.mse.mk/en) (English
version).

## Video Recording

Link to the demo video of the application is available [here](https://finkiukim-my.sharepoint.com/:v:/g/personal/iskra_stojchevska_students_finki_ukim_mk/EScL3nSnLz9CizH74esCoVIBv39C0RaNmo4Jo0USsHCXTA).

## Steps for Running the Prototype

### 1. Clone the Repository

> Requires a Git installation to be present on the system.

```bash
git clone https://github.com/pusoski/sda-msa-app.git

cd sda-msa-app/homework_three
```

### 2. Run Through Docker / Docker Compose

> Requires a Docker installation to be present on the system.

```bash
docker-compose up --build
```

### 3. Open the Application

> Open your browser of choice.

Visit the application's URL: [http://localhost:3000](http://localhost:3000).

## Development Process

The development process took place through multiple Git branches.

`feature/personalization` - Used for the development of the Personalization page functionalities.

`feature/get-started-page` - Used for working on the contents of the Get Started page.

`feature/data-analyses-page` - Used for the development of the Data Analyses functionalities.

`feature/data-reports-page` - Used for the development of the Data Reports functionalities.

`feature/issuers-page` - Used for the development of the Issuers page functionalities.

`app/gui` which served as the branch for merging the `feature/*` branches and for the backend functionalities.