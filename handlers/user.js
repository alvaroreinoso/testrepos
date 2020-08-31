'use strict';
const pool = require('.././db')

module.exports.getUser = async (event, context) => {

    const username = event.queryStringParameters.username

    const results = await pool.query(`SELECT * FROM users where username='${username}'`)

    return {
        statusCode: 200,
        body: JSON.stringify(results.rows)
    }
}