'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Team, User, Customer } = require('.././models');

module.exports.joinTeam = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        const teamId = event.pathParameters.teamId

        user.teamId = teamId

        await user.save()

        return {
            statusCode: 204
        }
    } catch (err) {

        return {
            statusCode: 500
        }
    }

}

module.exports.getTeamsForBrokerage = async (event, context) => {


    try {
        const currentUser = await getCurrentUser(event.headers.Authorization)

        const teams = await Team.findAll({
            where: {
                brokerageId: currentUser.brokerageId
            },
            include: [{
                model: User
            }]
        })

        for (const team of teams) {

            team.dataValues.teammates = team.Users.length
        }

        return {
            body: JSON.stringify(teams),
            statusCode: 200
        }

    } catch (err) {

        return {
            statusCode: 500
        }
    }
}

module.exports.getCustomersForBrokerage = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        const customers = await Customer.findAll({
            where: {
                brokerageId: user.brokerageId
            }
        })

        return {
            body: JSON.stringify(customers),
            statusCode: 200
        }

    } catch (err) {

        return {
            statusCode: 500
        }
    }

}