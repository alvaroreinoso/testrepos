'use strict';
const pool = require('.././db')
const getCurrentUser = require('.././helpers/user').getCurrentUser


module.exports.getLanesByCurrentUser = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    const results = await pool.query(`SELECT * FROM lane where customer_location_id = ${user.brokerage_id}`)

    return {
        statusCode: 200,
        body: JSON.stringify(results.rows)
    }
}

module.exports.getLane = async (event, context) => {

    const lane_id = event.pathParameters.lane_id

    const results = await pool.query(`SELECT * FROM lane where id = ${lane_id}`)
    return {
        statusCode: 200,
        body: JSON.stringify(results.rows)
    }
};

module.exports.deleteLane = async (event, context) => {

    console.log(event.pathParameters)

    const lane_id = event.pathParameters.lane_id

    await pool.query(`DELETE FROM lane where id = ${lane_id}`)

    return {
        statusCode: 200,
    }
};

module.exports.addLane = async (event, context) => {
    // let req_lanes = {}
    // req_lanes.user_id = JSON.parse(event.body.user_id)
    // req_lanes.team_id = JSON.parse(event.body.team_id)
    // req_lanes.lane_id = JSON.parse(event.body.lane_id)


    const req = (JSON.parse(event.body))
    console.log(req)
    console.log(req.customer_location_id)

    // console.log(req_lanes)

    // parse multiple lane jsons

    // add to array of lanes

    // insert array of lanes

    await pool.query(`INSERT into lane VALUES (customer_location_id=${req.customer_location_id}, lane_location_id=${req.lane_location_id}, customer_is_shipper=${req.customer_is_shipper})`)

    return {
        statusCode: 204
    }
}
