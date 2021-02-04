'use strict';
const getCurrentUser = require('.././helpers/user')
const sendRequestAccountEmail = require('../ses/templates/requestAccount')
const sendCreateAccountEmail = require('../ses/templates/createAccount')
const { Team, User, Customer, Brokerage, Ledger } = require('.././models');
const corsHeaders = require('.././helpers/cors')
const { v4: uuidv4 } = require('uuid');

module.exports.requestAccount = async (event, context) => {

    try {
        const request = JSON.parse(event.body)
        const uuid = await uuidv4()

        const brokerage = await Brokerage.create({
            pin: uuid,
        })

        const ledger = await Ledger.create({
            brokerageId: brokerage.id
        })

        brokerage.ledgerId = ledger.id
        await brokerage.save()

        const userLedger = await Ledger.create({
            brokerageId: brokerage.id
        })

        const user = await User.create({
            firstName: request.firstName,
            lastName: request.lastName,
            brokerageId: brokerage.id,
            ledgerId: userLedger.id,
            admin: true,
            title: request.role,
            email: request.email,
            phone: request.phone,
            phoneExt: request.ext
        })

        const tms = request.tms

        if (tms === undefined) {
            await sendRequestAccountEmail(user)

        } else {
            await sendCreateAccountEmail(user, brokerage)
        }

        return {
            headers: corsHeaders,
            statusCode: 204
        }
        
    } catch (err) {
        console.log(err)
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }
}


module.exports.joinTeam = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        const teamId = event.pathParameters.teamId

        user.teamId = teamId

        await user.save()

        return {
            headers: corsHeaders,
            statusCode: 204
        }
    } catch (err) {

        return {
            headers: corsHeaders,
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
            headers: corsHeaders,
            statusCode: 200
        }

    } catch (err) {

        return {
            headers: corsHeaders,
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
            headers: corsHeaders,
            statusCode: 200
        }

    } catch (err) {

        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }

}