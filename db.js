const { Pool, Client } = require('pg')
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'my-db',
  password: 'postgres',
  port: 5432
})
client.connect()

console.log("Connected")
// client.query('SELECT * FROM customer')


client.query('SELECT * FROM customer', (err, res) => {
    console.log(err, res)
    client.end()
})

module.exports = client;