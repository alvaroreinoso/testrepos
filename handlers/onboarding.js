'use strict';
const getCurrentUser = require('.././helpers/user')
// const sendRequestAccountEmail = require('../ses/templates/requestAccount')
// const sendCreateAccountEmail = require('../ses/templates/createAccount')
const emailUserInvite = require('../ses/templates/emailUserInvite')
const { Team, User, Customer, Lane, Brokerage, Ledger, Location } = require('.././models');
const corsHeaders = require('.././helpers/cors')
const { Op } = require("sequelize");
const { v4: uuidv4 } = require('uuid');

module.exports.requestAccount = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

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
                    username: request.username,
                    firstName: request.firstName,
                    lastName: request.lastName,
                    brokerageId: brokerage.id,
                    ledgerId: userLedger.id,
                    admin: true,
                    // title: request.role,
                    email: request.email,
                    confirmed: true
                    // phone: request.phone,
                    // phoneExt: request.ext
                })

                console.log(user)

                // await sendCreateAccountEmail(user)
            // }
        // }

        return {
            headers: corsHeaders,
            statusCode: 201,
            body: JSON.stringify(user)
        }

    } catch (err) {
        console.log(err)
        return {
            headers: corsHeaders,
            statusCode: 500,
            body: JSON.stringify(err)
        }
    }
}

module.exports.inviteUser = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const currentUser = await getCurrentUser(event.headers.Authorization)

        if (currentUser.id == undefined) {
            return {
                statusCode: 401,
                headers: corsHeaders
            }
        }

        if (currentUser.admin == false) {
            return {
                headers: corsHeaders,
                statusCode: 403
            }
        }

        const request = JSON.parse(event.body)

        const newUser = await User.create({
            email: request.email,
            brokerageId: currentUser.brokerageId
        })

        const brokerage = await Brokerage.findOne({
            where: {
                id: currentUser.brokerageId
            }
        })

        await emailUserInvite(newUser, brokerage.name)

        return {
            statusCode: 204,
            headers: corsHeaders
        }
    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.acceptInvite = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const request = JSON.parse(event.body)
        
        const user = await User.findOne({
            where: {
                email: request.email
            }
        })

        if(!user || user.username) {
            throw new Error(' ')
        }

        user.firstName = request.firstName
        user.lastName = request.lastName
        user.username = request.username
        user.confirmed = true

        await user.save()
        

        return {
            headers: corsHeaders,
            statusCode: 204
        }

    } catch (err) {
        console.log(err)
        return {
            headers: corsHeaders,
            statusCode: 500,
            body: JSON.stringify(err)
        }
    }
}

module.exports.getBrokerageByUUID = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const uuid = event.pathParameters.uuid

        const brokerage = await Brokerage.findOne({
            where: {
                pin: uuid
            }
        })

        const user = (await brokerage.getUsers())[0]

        const response = {
            brokerage: brokerage,
            user: user
        }

        return {
            body: JSON.stringify(response),
            headers: corsHeaders,
            statusCode: 200
        }
    } catch (err) {
        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.getTeamsForBrokerage = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

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

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        const customers = await Customer.findAll({
            where: {
                brokerageId: user.brokerageId
            }
        })

        const customersWithStats = await Promise.all(await customers.map(async customer => {

            const locations = await customer.getCustomerLocations({
                include: [{
                    model: Location,
                }]
            })

            let laneIds = new Set()

            for (const location of locations) {
                const locationLanes = await Lane.findAll({
                    where: {
                        [Op.or]: [
                            { originLocationId: location.Location.id },
                            { destinationLocationId: location.Location.id }
                        ]
                    },
                    order: [
                        ['currentVolume', 'DESC'],
                    ],
                })

                for (const lane of locationLanes) {
                    laneIds.add(lane.id)
                }
            }

            const lanes = await Promise.all([...laneIds].map(async laneId => {

                const lane = await Lane.findOne({
                    where: {
                        id: laneId
                    }
                })

                return lane
            }))

            customer.dataValues.laneCount = lanes.length
            customer.dataValues.locationCount = locations.length

            if (lanes.length == 0) {
                customer.dataValues.loadsPerMonth = 0
                customer.dataValues.spendPerMonth = 0

                return customer

            } else {

                const spendPerMonth = await lanes.reduce((a, b) => ({ spend: a.spend + b.spend }))
                const loadsPerMonth = await lanes.reduce((a, b) => ({ currentVolume: a.currentVolume + b.currentVolume }))

                customer.dataValues.loadsPerMonth = loadsPerMonth.currentVolume
                customer.dataValues.spendPerMonth = spendPerMonth.spend

                return customer
            }
        }))

        return {
            body: JSON.stringify(customersWithStats),
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