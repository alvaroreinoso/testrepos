'use strict';
const db = require('../models/index')
const jwt = require('jsonwebtoken')

module.exports.getUser = async (event, context) => {

    try {
        const token = event.headers.Authorization

        const cognitoUser = jwt.decode(token)

        const user = await db.User.findOne({
            where: {
                username: cognitoUser['cognito:username']
            }
        })

        return {
            statusCode: 200,
            body: JSON.stringify(user)
        }

    } catch (err) {

        return {
            statusCode: 401
        }

    }
}