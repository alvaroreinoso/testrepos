'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, Ledger, User, CustomerLocation, Team, LanePartner, Location, Lane } = require('.././models')
const { getCustomerSpend } = require('.././helpers/getCustomerSpend')
const { Op } = require("sequelize");
const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.ORIGIN_URL,
    'Access-Control-Allow-Credentials': true,
}

module.exports.getTeamById = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            headers: corsHeaders,
            statusCode: 401
        }
    }

    try {
        const teamId = event.pathParameters.teamId

        const team = await Team.findOne({
            where: {
                id: teamId
            }
        })

        if (team === null) {
            return {
                headers: corsHeaders,
                statusCode: 404
            }
        }

        if (team.brokerageId != user.brokerageId) {
            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        const teammates = await team.getUsers({
            include: [{
                model: Customer,
                attributes: ['id'],
            }]
        })

        let customerIds = []
        teammates.forEach(teammate => {
            teammate.Customers.forEach(cust => {
                customerIds.push(cust.id)
            })
        })

        const uniqueCustomerIds = new Set(customerIds)

        const customers = await [...uniqueCustomerIds].map(async id => {

            const customer = await Customer.findOne({
                where: {
                    id: id
                }
            })

            customer.dataValues.spend = await getCustomerSpend(customer)

            return customer
        })

        const customersResolved = await Promise.all(customers)
        const topCustomers = [...customersResolved].sort((a, b) => { return b.dataValues.spend - a.dataValues.spend })

        team.dataValues.customerCount = uniqueCustomerIds.size

        team.dataValues.topCustomers = topCustomers

        return {
            body: JSON.stringify(team),
            headers: corsHeaders,
            statusCode: 200
        }
    } catch (err) {
        console.log(err)
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }
}

module.exports.getTeammatesForTeam = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)
        const teamId = event.pathParameters.teamId

        const team = await Team.findOne({
            where: {
                id: teamId,
            }
        })

        if (team === null) {
            return {
                headers: corsHeaders,
                statusCode: 404
            }
        }

        if (team.brokerageId != user.brokerageId) {
            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        const teammates = await team.getUsers()

        return {
            body: JSON.stringify(teammates),
            headers: corsHeaders,
            statusCode: 200
        }
    } catch {

        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }
}

module.exports.getLanesForTeam = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        const teamId = event.pathParameters.teamId

        const team = await Team.findOne({
            where: {
                id: teamId
            }
        })

        if (team.brokerageId != user.brokerageId) {
            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        const teammates = await team.getUsers({
            include: [{
                model: Customer,
                attributes: ['id'],
                through: { attributes: [] },
                include: [{
                    model: CustomerLocation,
                    include: [{
                        model: Location,
                        include: [{
                            model: Lane,
                            attributes: ['id']
                        }]
                    }]
                }]
            }, {
                model: Lane,
                attributes: ['id']
            }, {
                model: Location,
                include: [{
                    model: Lane,
                    attributes: ['id']
                }]
            }]
        })

        let laneIds = []
        teammates.forEach(teammate => {
            teammate.Customers.forEach(cust => {
                cust.CustomerLocations.forEach(location => {
                    location.Location.Lanes.forEach(lane => {
                        laneIds.push(lane.id)
                    })
                })
            })
            teammate.Lanes.forEach(lane => {
                laneIds.push(lane.id)
            })
            teammate.Locations.forEach(loc => {
                loc.Lanes.forEach(locLane => {
                    laneIds.push(locLane.id)
                })
            })
        })

        const uniqueLaneIds = new Set(laneIds)
        const lanes = await [...uniqueLaneIds].map(async laneId => {

            const lane = await Lane.findOne({
                where: {
                    id: laneId
                },
                include: [{
                    model: Location,
                    as: 'origin',
                    include: [{
                        model: CustomerLocation,
                        include: [{
                            model: Customer
                        }]
                    }, {
                        model: LanePartner
                    }]
                },
                {
                    model: Location,
                    as: 'destination',
                    include: [{
                        model: CustomerLocation,
                        include: [{
                            model: Customer
                        }]
                    }, {
                        model: LanePartner
                    }]
                }]
            })
            return lane
        })


        const lanesResolved = await Promise.all(lanes)
        const laneSpend = lanesResolved.map(lane => lane.spend)
        const teamSpend = await laneSpend.reduce((a, b) => a + b)

        const loadsPerWeek = await lanesResolved.reduce((a, b) => ({ frequency: a.frequency + b.frequency }))

        const body = {
            revenue: teamSpend,
            loadsPerWeek: loadsPerWeek.frequency,
            Lanes: lanesResolved
        }

        return {
            body: JSON.stringify(body),
            headers: corsHeaders,
            statusCode: 200
        }

    }

    catch (err) {
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }
}

module.exports.addTeam = async (event, context) => {

    try {

        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        const request = JSON.parse(event.body)

        const team = await Team.create({
            icon: request.icon,
            name: request.name,
            brokerageId: request.brokerageId,
        })

        await team.createLedger({
            brokerageId: team.brokerageId
        })

        return {
            headers: corsHeaders,
            statusCode: 204
        }
    }
    catch (err) {
        console.log(err)
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }
}

module.exports.editTeam = async (event, context) => {
    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {

            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        const teamId = event.pathParameters.teamId

        const request = JSON.parse(event.body)

        const team = await Team.findOne({
            where: {
                id: teamId
            }
        })

        team.name = request.name,
            team.icon = request.icon

        await team.save()

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

module.exports.deleteTeam = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.admin == false) {

            return {
                headers: corsHeaders,
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

module.exports.removeTeammate = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            headers: corsHeaders,
            statusCode: 401
        }
    }

    const targetUserId = event.pathParameters.userId

    const targetUser = await User.findOne({
        where: {
            id: targetUserId
        }
    })

    targetUser.teamId = null

    await targetUser.save()

    return {
        headers: corsHeaders,
        statusCode: 204
    }
}

module.exports.addTeammate = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {

        return {
            headers: corsHeaders,
            statusCode: 401
        }
    }

    const request = JSON.parse(event.body)

    const targetUserId = request.userId
    const teamId = request.teamId

    const targetUser = await User.findOne({
        where: {
            id: targetUserId
        }
    })

    targetUser.teamId = teamId

    await targetUser.save()

    return {
        headers: corsHeaders,
        statusCode: 204
    }

}