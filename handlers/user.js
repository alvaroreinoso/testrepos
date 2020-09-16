'use strict';
// const db = require('../models/index')
const getCurrentUser = require('.././helpers/user').getCurrentUser
const jwt = require('jsonwebtoken')
const { Team, Brokerage, User } = require('.././models');

module.exports.getUser = async (event, context) => {

    try {
        const token = event.headers.Authorization

        const cognitoUser = jwt.decode(token)

        const user = await User.findOne({
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

module.exports.getTeams = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        const teams = await Team.findAll({
            where: {
                brokerageId: user.brokerageId
            }
        })

        return {
            statusCode: 200,
            body: JSON.stringify(teams)
        }

    } catch (err) {

        return {
            statusCode: 401
        }
    }

}