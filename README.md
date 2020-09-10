# Terralanes Backend


## Requirements
1. Make sure you have node and npm installed
    Node: https://nodejs.org/en/download/
    NPM: https://www.npmjs.com/get-npm

### 2. Install dependencies
In a separate terminal window, run
```
npm install
```

### 3. Start database with sequelize-cli
1. In the project root run
```
npm run db:start
```
2. Then seed
```
npm run db:seed
```
3. Then to stop
```
npm run db:stop
```

### 4. Connect to database
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

### 5. Start the local server on Port 5000

Run
```
sls offline --httpPort 5000
```

You can now hit the routes locally. I recommend installing *** Insomnia *** to do this.

1. To install insomnia, go to https://support.insomnia.rest/article/11-getting-started#:~:text=Install%20the%20App&text=Visit%20the%20Downloads%20page%20to%20download%20the%20installer%20for%20your%20operating%20system.&text=After%20downloading%20the%20installer%2C%20double,create%20your%20first%20HTTP%20request.

1. Open insomnia and import the `Insomnia.json` file for the project




