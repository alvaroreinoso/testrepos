'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const jwt = require('jsonwebtoken')
const { Team, Brokerage, User, Ledger } = require('.././models');

module.exports.getUser = async (event, context) => {

    try {
        const token = event.headers.Authorization

        const cognitoUser = jwt.decode(token)

        const user = await User.findOne({
            where: {
                username: cognitoUser['cognito:username']
            },
            include: [{
                model: Brokerage,
                required: true
            }, {
                model: Team,
                required: true
            }]
        })

        if (user != null) {

            return {
                statusCode: 200,
                body: JSON.stringify(user)
            }

        } else {

            return {
                statusCode: 404
            }

        }

    } catch (err) {

        return {
            statusCode: 401
        }

    }
}

module.exports.getUserById = async (event, context) => {

    try {
    
        const currentUser = await getCurrentUser(event.headers.Authorization)

        const targetUserId = event.pathParameters.id

        const user = await User.findOne({
            where: {
                id: targetUserId,
                brokerageId: currentUser.brokerageId
            },
            include: [{
                model: Team,
                required: true
            },
            {
                model: Brokerage,
                required: true
            }]
        })

        if (user == null) {
            return {
                statusCode: 404
            }
        }

        return {
            body: JSON.stringify(user),
            statusCode: 200
        }

    } catch (err) {

        return {
            statusCode: 401
        }

    }

}

module.exports.createProfile = async (event, context) => {

    const req = await (JSON.parse(event.body))

    try {

        const ledger = await Ledger.create()

        await User.create({
            username: req.username,
            email: req.email,
            brokerageId: req.brokerageId,
            ledgerId: ledger.id
        })

        return {
            statusCode: 200
        }

    } catch (err) {
        console.log(err)
        return {
            statusCode: 500
        }
    }
}

module.exports.updateProfile = async (event, context) => {

    const req = (JSON.parse(event.body))

    const user = await getCurrentUser(event.headers.Authorization)

    try {

        user.firstName = req.firstName
        user.lastName = req.lastName
        user.phone = req.phone
        user.title = req.title
        user.teamId = req.teamId
        user.profileImage = req.profileImage
        user.confirmed = true

        await user.save()

        return {
            statusCode: 200
        }
    } catch (err) {

        return {
            statusCode: 500
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