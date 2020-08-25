'use strict';
const pool = require('.././db')

module.exports.getUser = async (event, context) => {

    console.log(event.queryStringParameters.username)
    
    const username = event.queryStringParameters.username

    const results = await pool.query(`SELECT * FROM "user" where firebase_user_id='${username}'`)

    return {
        statusCode: 200,
        body: JSON.stringify(results.rows)
    }
}