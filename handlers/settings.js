'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Team, User, Ledger, Brokerage } = require('.././models');

module.exports.editBrokerage = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.admin == false) {

            return {
                statusCode: 403
            }
        }

        const request = JSON.parse(event.body)

        const brokerage = await Brokerage.findOne({
            where: {
                id: request.id
            }
        })

        brokerage.name = request.name,
        brokerage.address = request.address,
        brokerage.address2 = request.address2,
        brokerage.city = request.city,
        brokerage.state = request.state,
        brokerage.zipcode = request.zipcode,
        brokerage.phone = request.phone

        await brokerage.save()

        return {
            statusCode: 204
        }
    } catch (err) {

        console.log(err)

        return {
            statusCode: 500
        }
    }

}

module.exports.editTeam = async (event, context) => {


    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.admin == false) {

            return {
                statusCode: 403
            }
        }

        const request = JSON.parse(event.body)

        const team = await Team.findOne({
            where: {
                id: request.id
            }
        })

        team.name = request.name,
        team.icon = request.icon

        await team.save()

        return {
            statusCode: 204
        }
    } catch (err) {

        console.log(err)

        return {
            statusCode: 500
        }
    }

}

module.exports.deleteTeam = async (event, context) => {

    try {

        const user = await getCurrentUser(event.headers.Authorization)

        if (user.admin == false) {

            return {
                statusCode: 403
            }
        }

        const teamId = event.pathParameters.teamId

        const team = await Team.findOne({
            where: {
                id: teamId
            },
        })

        await Ledger.destroy({
            where: {
                id: team.ledgerId
            }
        })

        await team.destroy()

        return {
            statusCode: 204
        }
    } catch (err) {

        console.log(err)

        return {
            statusCode: 500
        }
    }
}