# Terralanes Backend


## Requirements
1. Make sure you have docker installed https://docs.docker.com/get-docker/
1. Make sure you have node and npm installed
    Node: https://nodejs.org/en/download/
    NPM: https://www.npmjs.com/get-npm

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

You can now hit the routes locally. I recommend installing *** Insomnia *** to do this.

1. To install insomnia, go to https://support.insomnia.rest/article/11-getting-started#:~:text=Install%20the%20App&text=Visit%20the%20Downloads%20page%20to%20download%20the%20installer%20for%20your%20operating%20system.&text=After%20downloading%20the%20installer%2C%20double,create%20your%20first%20HTTP%20request.

1. Open insomnia and import the `Insomnia.json` file for the project




