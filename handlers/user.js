'use strict';
const db = require('../models/index')

module.exports.getUser = async (event, context) => {

    const req_username = event.queryStringParameters.username

    console.log(req_username)

    const user = await db.User.findOne({
        where: {
            username: req_username
        }
    })

    console.log(user)

    return {
        statusCode: 200,
        body: JSON.stringify(user)
    }
}