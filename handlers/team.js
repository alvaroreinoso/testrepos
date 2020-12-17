'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, CustomerLocation, Team, LanePartner, Location, Lane } = require('.././models')
const { getCustomerSpend } = require('.././helpers/getCustomerSpend')
const { Op } = require("sequelize");

module.exports.getTeamById = async (event, context) => {


    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
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
                statusCode: 404
            }
        }

        if (team.brokerageId != user.brokerageId) {
            return {
                statusCode: 401
            }
        }

        return {
            body: JSON.stringify(team),
            statusCode: 200
        }
    } catch {

        return {
            statusCode: 500
        }
    }

}
module.exports.getLanesForTeam = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401
        }
    }

    try {
        const teamId = event.pathParameters.teamId

        const team = await Team.findOne({
            where: {
                id: teamId,
                brokerageId: user.brokerageId
            }
        })

        const customers = await team.getCustomers()

        const customerLocations = await customers.map(async customer => {
            const cLs = await customer.getCustomerLocations({
                include: [{
                    model: Location,
                    required: true
                }]
            })

            return cLs
        })

        const clResolved = await Promise.all(customerLocations)

        let locations = []
        for (const arr of clResolved) {
            for (const loc of arr) {
                locations.push(loc.Location)
            }
        }

        let lanes = []
        for (const loc of locations) {
            const lanesForLocation = await loc.getLanes({
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

            for (const lane of lanesForLocation) {
                lanes.push(lane)
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify(lanes)
        }

    } catch (err) {
        return {
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
                statusCode: 404
            }
        }

        if (team.brokerageId != user.brokerageId) {
            return {
                statusCode: 401
            }
        }

        const teammates = await team.getUsers()

        return {
            body: JSON.stringify(teammates),
            statusCode: 200
        }
    } catch {

        return {
            statusCode: 500
        }
    }
}

module.exports.getTopCustomersForTeam = async (event, context) => {

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
                statusCode: 401
            }
        }

        const customers = await Customer.findAll({
            where: {
                teamId: team.id
            }
        })

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
    }

    catch (err) {
        return {
            statusCode: 500
        }
    }
}