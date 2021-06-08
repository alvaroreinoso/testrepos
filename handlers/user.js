'use strict';
const getCurrentUser = require('.././helpers/user')
const jwt = require('jsonwebtoken')
const { Team, Brokerage, User, Lane, Location, CustomerLocation, Customer, LanePartner } = require('.././models');
const { getCustomerSpendAndLoadCount } = require('.././helpers/getCustomerSpend')
const corsHeaders = require('.././helpers/cors')
const { getStatusQueryOperator } = require('../helpers/getStatusQueryOperator')
const { getHiddenPotentialForUser } = require('../helpers/getPotentialForOwnedLanes')
const { Op } = require('sequelize')

module.exports.getUser = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const token = event.headers.Authorization

        const cognitoUser = jwt.decode(token)

        if (cognitoUser == null) {
            return {
                headers: corsHeaders,
                statusCode: 401,
            }
        }

        const user = await User.findOne({
            where: {
                username: cognitoUser['cognito:username']
            },
        })

        if (user == null) {
            return {
                headers: corsHeaders,
                statusCode: 404,
            }
        }

        return {
            headers: corsHeaders,
            statusCode: 200,
            body: JSON.stringify(user),
        }

    } catch (err) {
        console.log(err)
        return {
            headers: corsHeaders,
            statusCode: 500,
        }
    }
}

module.exports.getEmailById = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const userId = event.pathParameters.userId

        const user = await User.findOne({
            where: {
                id: userId
            }
        })

        return {
            body: JSON.stringify(user.email),
            statusCode: 200,
            headers: corsHeaders
        }
    } catch (err) {

        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.getUserById = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const currentUser = await getCurrentUser(event.headers.Authorization)

        if (currentUser.id == null) {
            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        const targetUserId = event.pathParameters.userId

        const user = await User.findOne({
            where: {
                id: targetUserId,
                brokerageId: currentUser.brokerageId
            },
            include: [{
                model: Team,
            },
            {
                model: Brokerage,
                required: true
            }]
        })

        if (user == null) {
            return {
                headers: corsHeaders,
                statusCode: 404,
            }
        }

        const customers = await user.getCustomers()
        user.dataValues.customerCount = customers.length

        const lanes = await user.getLanes()

        if (lanes.length == 0) {
            user.dataValues.revenue = 0
            user.dataValues.loadsPerMonth = 0

            return {
                body: JSON.stringify(user),
                headers: corsHeaders,
                statusCode: 200
            }
        }
        const laneSpend = await lanes.map(lane => lane.spend)
        const revenue = await laneSpend.reduce((a, b) => (a + b))
        user.dataValues.revenue = revenue

        const loadsPerMonth = await lanes.reduce((a, b) => ({ currentVolume: a.currentVolume + b.currentVolume }))
        user.dataValues.loadsPerMonth = loadsPerMonth.currentVolume

        return {
            body: JSON.stringify(user),
            headers: corsHeaders,
            statusCode: 200
        }

    } catch (err) {
        return {
            headers: corsHeaders,
            statusCode: 500,
        }
    }
}

module.exports.createProfile = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const req = JSON.parse(event.body)

        await User.create({
            username: req.username,
            email: req.email,
            brokerageId: req.brokerageId,
        })

        return {
            headers: corsHeaders,
            statusCode: 200,
        }

    } catch (err) {

        console.log(err)
        return {
            headers: corsHeaders,
            statusCode: 500,
        }

    }
}

module.exports.updateProfile = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        const req = JSON.parse(event.body)

        user.firstName = req.firstName
        user.lastName = req.lastName
        user.phone = req.phone
        user.title = req.title
        user.teamId = req.teamId
        user.profileImage = req.profileImage
        user.username = req.username
        user.confirmed = true

        await user.save()

        return {
            headers: corsHeaders,
            statusCode: 200,
        }
    } catch (err) {

        return {
            headers: corsHeaders,
            statusCode: 500,
        }
    }
}

module.exports.updateUser = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        if (user.admin == false) {
            return {
                headers: corsHeaders,
                statusCode: 403
            }
        }

        const targetUserId = event.pathParameters.userId

        const targetUser = await User.findOne({
            where: {
                id: targetUserId,
                brokerageId: user.brokerageId,
                deleted: false,
            },
            paranoid: false
        })

        if (targetUser == null) {
            return {
                headers: corsHeaders,
                statusCode: 404
            }
        }

        const request = JSON.parse(event.body)

        const activationStatus = request.active
        const adminStatus = request.admin


        if (targetUser.admin == true) {

            const adminUsers = await User.findAll({
                where: {
                    brokerageId: user.brokerageId,
                    admin: true,
                }
            })

            if (adminUsers.length == 1) {

                if (activationStatus == true && adminStatus == true) {

                    return {
                        headers: corsHeaders,
                        statusCode: 204
                    }
                }
                const message = "Cannot remove last admin for brokerage"
                return {
                    headers: corsHeaders,
                    statusCode: 400,
                    body: JSON.stringify(message)
                }

            } else {

                targetUser.admin = adminStatus

                await targetUser.save()

                if (activationStatus == false) {

                    targetUser.active = false

                    await targetUser.destroy()
                }

                else {
                    targetUser.active = true

                    await targetUser.restore()
                }

                return {
                    headers: corsHeaders,
                    statusCode: 204,
                }
            }

        } else {

            targetUser.admin = adminStatus

            await targetUser.save()

            if (activationStatus == false) {

                targetUser.active = false

                await targetUser.destroy()
            }

            else {
                targetUser.active = true

                await targetUser.restore()
            }


            return {
                headers: corsHeaders,
                statusCode: 204,
            }
        }

    } catch (err) {
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }

}
module.exports.deleteUser = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            headers: corsHeaders,
            statusCode: 401
        }
    }

    if (user.admin == false) {
        return {
            headers: corsHeaders,
            statusCode: 403
        }
    }

    const targetUserId = event.pathParameters.userId

    const targetUser = await User.findOne({
        where: {
            id: targetUserId,
            brokerageId: user.brokerageId
        }
    })

    if (targetUser == null) {
        return {
            headers: corsHeaders,
            statusCode: 404
        }
    }

    if (targetUser.admin == true) {
        const adminUsers = await User.findAll({
            where: {
                brokerageId: user.brokerageId,
                admin: true
            }
        })

        if (adminUsers.length == 1) {

            const message = "Cannot remove last admin from brokerage"
            return {
                headers: corsHeaders,
                statusCode: 400,
                body: JSON.stringify(message)
            }
        } else {
            targetUser.deleted = true
            targetUser.active = false
            await targetUser.destroy()
            return {
                headers: corsHeaders,
                statusCode: 204
            }
        }

    } else {
        targetUser.deleted = true
        targetUser.active = false
        await targetUser.destroy()

        return {
            headers: corsHeaders,
            statusCode: 204,
        }
    }
}

module.exports.getTeams = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        const teams = await Team.findAll({
            where: {
                brokerageId: user.brokerageId
            }
        })

        return {
            headers: corsHeaders,
            statusCode: 200,
            body: JSON.stringify(teams),
        }

    } catch (err) {

        return {
            headers: corsHeaders,
            statusCode: 401,
        }
    }

}

module.exports.getTopCustomersForUser = async (event, context) => {
    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const currentUser = await getCurrentUser(event.headers.Authorization)
        const userId = event.pathParameters.userId

        if (currentUser.id === null) {
            return {
                headers: corsHeaders,
                statusCode: 401,
            }
        }

        const targetUser = await User.findOne({
            where: {
                id: userId,
                brokerageId: currentUser.brokerageId
            }
        })

        if (targetUser === null) {
            return {
                headers: corsHeaders,
                statusCode: 404,
            }
        }

        const customers = await targetUser.getCustomers()

        const customersWithSpend = await customers.map(async customer => {
            [customer.dataValues.spend, customer.dataValues.loadsPerMonth] = await getCustomerSpendAndLoadCount(customer)

            return customer
        })

        const customersResolved = await Promise.all(customersWithSpend)
        const topCustomers = [...customersResolved].sort((a, b) => { return b.dataValues.spend - a.dataValues.spend })

        const response = {
            body: JSON.stringify(topCustomers),
            headers: corsHeaders,
            statusCode: 200,
        }

        return response
    } catch (err) {
        console.log(err)

        return {
            headers: corsHeaders,
            statusCode: 500,
        }
    }
}

module.exports.getTopLanesForUser = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    const currentUser = await getCurrentUser(event.headers.Authorization)
    const userId = event.pathParameters.userId

    if (currentUser.id == null) {
        return {
            headers: corsHeaders,
            statusCode: 401,
        }
    }

    try {
        const targetUser = await User.findOne({
            where: {
                id: userId,
                brokerageId: currentUser.brokerageId
            }
        })

        if (targetUser == null) {
            return {
                headers: corsHeaders,
                statusCode: 404,
            }
        }

        const status = event.queryStringParameters.status
        const statusOperator = await getStatusQueryOperator(status)

        const lanes = await targetUser.getLanes({
            where: {
                [Op.not]: {
                    owned: statusOperator
                }
            },
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

        if (lanes.length == 0) {
            const body = {
                loadsPerMonth: 0,
                spend: 0,
                Lanes: lanes
            }

            return {
                body: JSON.stringify(body),
                headers: corsHeaders,
                statusCode: 200
            }
        }

        switch (status) {
            case 'owned': {
                const sortedLanes = await lanes.sort((a, b) => b.spend - a.spend)

                const totalSpend = await lanes.reduce((a, b) => ({ spend: a.spend + b.spend }))
                const loadsPerMonth = await lanes.reduce((a, b) => ({ currentVolume: a.currentVolume + b.currentVolume }))

                const body = {
                    loadsPerMonth: loadsPerMonth.currentVolume,
                    spend: totalSpend.spend,
                    Lanes: sortedLanes
                }

                return {
                    body: JSON.stringify(body),
                    statusCode: 200,
                    headers: corsHeaders
                }
            } case 'opportunities': {
                const ownedLanePotential = await getHiddenPotentialForUser(targetUser)

                const sortedLanes = await lanes.sort((a, b) => b.opportunitySpend - a.opportunitySpend)
                const totalSpend = await lanes.reduce((a, b) => ({ opportunitySpend: a.opportunitySpend + b.opportunitySpend }))

                const loadsPerMonth = await lanes.reduce((a, b) => ({ opportunityVolume: a.opportunityVolume + b.opportunityVolume }))
                const totalOpportunitySpend = totalSpend.opportunitySpend + ownedLanePotential

                const body = {
                    loadsPerMonth: loadsPerMonth.opportunityVolume,
                    spend: totalOpportunitySpend,
                    Lanes: sortedLanes
                }

                return {
                    body: JSON.stringify(body),
                    statusCode: 200,
                    headers: corsHeaders
                }

            } case 'potential': {
                const sortedLanes = await lanes.sort((a, b) => b.potentialSpend - a.potentialSpend)

                const totalSpend = await lanes.reduce((a, b) => ({ potentialSpend: a.potentialSpend + b.potentialSpend }))

                const loadsPerMonth = await lanes.reduce((a, b) => ({ potentialVolume: a.potentialVolume + b.potentialVolume }))
        
                const body = {
                    loadsPerMonth: loadsPerMonth.potentialVolume,
                    spend: totalSpend.potentialSpend,
                    Lanes: sortedLanes
                }

                return {
                    body: JSON.stringify(body),
                    statusCode: 200,
                    headers: corsHeaders
                }
            }
        }

                const sortedLanes = [...lanes].sort((a, b) => { return b.spend - a.spend })

                const response = {
                    body: JSON.stringify(sortedLanes),
                    headers: corsHeaders,
                    statusCode: 200,
                }

                return response

        } catch (err) {
            console.log(err)
            return {
                headers: corsHeaders,
                statusCode: 500,
            }
        }
    }

module.exports.getAdminUsers = async (event, context) => {

        if (event.source === 'serverless-plugin-warmup') {
            console.log('WarmUp - Lambda is warm!');
            return 'Lambda is warm!';
        }

        try {
            const currentUser = await getCurrentUser(event.headers.Authorization)

            if (currentUser.id == null) {
                return {
                    headers: corsHeaders,
                    statusCode: 401
                }
            }

            const admins = await User.findAll({
                where: {
                    brokerageId: currentUser.brokerageId,
                    admin: true
                }
            })

            if (admins.length == 0) {
                return {
                    headers: corsHeaders,
                    statusCode: 404,
                }
            }

            return {
                body: JSON.stringify(admins),
                headers: corsHeaders,
                statusCode: 200
            }

        } catch (err) {
            return {
                headers: corsHeaders,
                statusCode: 500,
            }
        }
    }
