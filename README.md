# Terralanes Backend

## Run the backend locally

Our backend development environment relies on the following services:

1. Postgres database
2. SLS offline server
3. Elasticsearch

### 1. Requirements

1. Make sure you have node and yarn installed
   Node: https://nodejs.org/en/download/
   yarn: https://www.npmjs.com/get-yarn

### 2. Install dependencies

Run

```
yarn install
```

### 3. To run the database locally

1. In the project root run

```
yarn db:start
```

2. Then seed

```
yarn db:seed
```

3. Then to stop

```
yarn db:stop
```

4. To restart and reseed the database, run

```
yarn db:restart
```

This is often necessary when testing csv upload.

### 4. Connect to database

1. If you need to interact with the database locally, I recommend using `pgcli`

To install it, run

```
brew install pgcli
```

1. Once you have that installed, run

```
pgcli postgresql://postgres:postgres@localhost:5432/my-db
```

1. You should now be connected to the database in your terminal window. You can run SQL queries from the command line.

1. Example commands:

   1. List all tables

   ```
   \dt
   ```

   1. view all lanes

   ```
   select * from lanes
   ```

### 5. Start the local server on Port 5000

Run

```
sls offline --httpPort 5000
```

You can now hit the routes locally. I recommend installing **_ Insomnia _** to do this.

1. To install insomnia, go to https://support.insomnia.rest/article/11-getting-started#:~:text=Install%20the%20App&text=Visit%20the%20Downloads%20page%20to%20download%20the%20installer%20for%20your%20operating%20system.&text=After%20downloading%20the%20installer%2C%20double,create%20your%20first%20HTTP%20request.

1. Open insomnia and import the `Insomnia.json` file for the project

### 6. Elasticsearch

1. Make sure you have the database up and running locally, and make sure you have the database seeded

1. Install elasticsearch with brew
   https://www.elastic.co/guide/en/elasticsearch/reference/current/brew.html

1. Follow instructions to configure elasticsearch
   https://www.elastic.co/guide/en/elasticsearch/reference/current/settings.html

1. In an open terminal window, run

```
elasticsearch
```

1. You can hit localhost:9200 in your browser to verify that elasticsearch is running

1. To setup elasticsearch with our indices and data, run

```
yarn elastic:start
```

1. To stop elasticsearch, run

```
yarn elastic:stop
```

and ^c

### Elasticsearch Hooks

Our searchable data models are designed to stay up to date with `sequelize hooks`. After one of these models saves to the database, is updated, or deleted, search results should reflect these changes.

### Tests

At the moment, our test setup relies on the database being up and running from initial setup.

To run tests, run

```
yarn test
```

### Staging and Prod
