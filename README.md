# Terralanes Backend


## Requirements
1. Make sure you have docker installed
1. Make sure you have npm installed

## Setup
### 1. Set up environment
Create a file in the project root with the name `.env` and copy the contents of `.env.sample` into the new file.

### 2. Start database with docker-compose
In the project root run
```
docker-compose up
```

### 3. Install dependencies
In a separate terminal window, run
```
npm install
```

### 4. Seed database
Run
```
./seed.sh
```

### 5. Connect to database
1. For interacting with the database locally I recommend using `pgcli`

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

### 6. Start the local server

Run
```
sls offline start
```

You can now hit the routes locally


