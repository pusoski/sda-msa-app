# Tech Prototype Application

The application sources its information from the [Macedonian Stock Exchange website](https://www.mse.mk/en) (English
version).

## Video Recording

Due to the size of the original file, the video recording demonstrating the prototype's functionality is available [here](https://finkiukim-my.sharepoint.com/:v:/g/personal/hristijan_pusoski_students_finki_ukim_mk/Ef20IGdAx81DiJ0Ql_itX3IBwrbJ2D4jNFlr23hzHBFLNQ).

## Steps for Running the Prototype

### 1. Clone the Repository

> Requires a Git installation to be present on the system.

```bash
git clone https://github.com/pusoski/sda-msa-app.git

cd sda-msa-app/homework_two/tech_prototype/code
```

### 2. Run Through Docker / Docker Compose

> Requires a Docker installation to be present on the system.

```bash
docker-compose up --build
```

## Note About the Prototype

Once run using Docker / Docker Compose, the prototype application (Homework Two) can be accessed through
[localhost:3000](http://localhost:3000). To access the database, you can use a software like JetBrains
DataGrip/DataSpell. Credentials can be found in the [.env file](./code/.env). Take a look at the
[docker-compose.yml](./code/docker-compose.yml) for more information.

## Note About the Filters (Pipeline/Backend)

Changes to the functioning of the filters/pipeline, which were initially created as part of
[Homework One](../../homework_one), have been made to increase their performance.
**The testing showed increase in speed of `32%`**. As part of the prototype, only the first filter has been implemented.
The updated codes of the three filters are available [here](./code/backend/app/filters).