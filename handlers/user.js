'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const jwt = require('jsonwebtoken')
const { Team, Brokerage, User, Ledger, Location } = require('.././models');
const { getCustomerSpend } = require('.././helpers/getCustomerSpend')

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

        const customers = await user.getCustomers()
        user.dataValues.customerCount = customers.length

        const lanes = await user.getLanes()
        const laneSpend = await lanes.map(lane => lane.spend)
        const revenue = await laneSpend.reduce((a, b) => (a + b))
        user.dataValues.revenue = revenue

        const loadsPerWeek = await lanes.reduce((a, b) => ({ frequency: a.frequency + b.frequency}))
        user.dataValues.loadsPerWeek = loadsPerWeek.frequency

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
            statusCode: 500
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

        const ledger = await Ledger.create({
            brokerageId: req.brokerageId
        })

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

module.exports.getTopCustomersForUser = async (event, context) => {

    const currentUser = await getCurrentUser(event.headers.Authorization)
    const userId = event.pathParameters.userId

    if (currentUser.id == null) {
        return {
            statusCode: 401
        }
    }

    try {
        const targetUser = await User.findOne({
            where: {
                id: userId,
            }
        })

        if (targetUser == null) {
            return {
                statusCode: 404
            }
        }

        if (targetUser.brokerageId != currentUser.brokerageId) {
            return {
                statusCode: 401
            }
        }

        const customers = await targetUser.getCustomers()

        const customersWithSpend = await customers.map(async customer => {

            customer.dataValues.spend = await getCustomerSpend(customer)

            return customer
        })

        const customersResolved = await Promise.all(customersWithSpend)

        const response = {
            body: JSON.stringify(customersResolved.sort((a, b) => { return b.dataValues.spend - a.dataValues.spend })),
            statusCode: 200
        }

        return response

    } catch (err) {
        
        return {
            statusCode: 500
        }
    }

}

module.exports.getTopLanesForUser = async (event, context) => {

    const currentUser = await getCurrentUser(event.headers.Authorization)
    const userId = event.pathParameters.userId

    if (currentUser.id == null) {
        return {
            statusCode: 401
        }
    }

    try {
        const targetUser = await User.findOne({
            where: {
                id: userId,
            }
        })

        if (targetUser == null) {
            return {
                statusCode: 404
            }
        }

        if (targetUser.brokerageId != currentUser.brokerageId) {
            return {
                statusCode: 401
            }
        }

        const lanes = await targetUser.getLanes({
            include: [{
                model: Location,
                as: 'origin',
                attributes: ['city', 'state'],
                required: true
            }, {
                model: Location,
                as: 'destination',
                attributes: ['city', 'state'],
                required: true
            }]
        })

        const lanesWithSpend = await lanes.map(lane => {

            const spend = lane.frequency * lane.rate

            lane.dataValues.spend = spend

            return lane
        })

        const lanesResolved = await Promise.all(lanesWithSpend)

        const response = {
            body: JSON.stringify(lanesResolved.sort((a, b) => { return b.dataValues.spend - a.dataValues.spend })),
            statusCode: 200
        }

        return response

    } catch (err) {
        
        return {
            statusCode: 500
        }
    }

}