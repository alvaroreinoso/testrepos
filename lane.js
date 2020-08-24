'use strict';
const pool = require('./db')

module.exports.getLanes = async (event, context) => {
    
    console.log(event.pathParameters)

    const brokerage_id = event.pathParameters.brokerage_id

    const results = await pool.query(`SELECT * FROM lane where customer_location_id = ${brokerage_id}`)
    return {
        statusCode: 200,
        body: JSON.stringify(results.rows)
    }
};
