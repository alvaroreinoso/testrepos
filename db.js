const { Pool } = require('pg')
require('dotenv').config()

if (process.env.DATABASE_HOST === 'localhost') {
  const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'my-db',
    password: 'postgres',
    port: 5432
  })

  // console.log(pool)

  module.exports = pool;
} else {

  // connect to Aurora db and export

}




