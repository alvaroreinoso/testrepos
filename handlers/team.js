'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, Ledger, CustomerLocation, Team, LanePartner, Location, Lane } = require('.././models')
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

        const teammates = await team.getUsers({
            include: [{
                model: Customer,
                include: [{
                    model: CustomerLocation,
                    include: [{
                        model: Location,
                        include: [{
                            model: Lane
                        }]
                    }]
                }]
            }, {
                model: Lane
            }, {
                model: Location,
                include: [{
                    model: Lane
                }]
            }]
        })

        let customerIds = []
        let laneIds = []
        for (const teammate of teammates) {
            for (const cust of teammate.Customers) {
                customerIds.push(cust.id)
                for (const location of cust.CustomerLocations) {
                    for (const lane of location.Location.Lanes) {
                        laneIds.push(lane.id)
                    }
                }
            }
            for (const lane of teammate.Lanes) {
                laneIds.push(lane.id)
            }
            for (const loc of teammate.Locations) {
                for (const locLane of loc.Lanes) {
                    laneIds.push(locLane.id)
                }
            }
        }

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
        team.dataValues.revenue = teamSpend

        const uniqueCustomerIds = new Set(customerIds)
        team.dataValues.customerCount = uniqueCustomerIds.size

        const loadsPerWeek = await lanesResolved.reduce((a, b) => ({ frequency: a.frequency + b.frequency }))
        team.dataValues.loadsPerWeek = loadsPerWeek.frequency
        team.dataValues.Lanes = lanesResolved

        return {
            body: JSON.stringify(team),
            statusCode: 200
        }
    } catch (err) {
        console.log(err)
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

module.exports.addTeam = async (event, context) => {

    try {

        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
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
            statusCode: 204
        }
    }
    catch (err) {
        console.log(err)
        return {
            statusCode: 500
        }
    }
}