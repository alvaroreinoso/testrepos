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
                through: {attributes: []},
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
        console.log(uniqueLaneIds.size)
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

        // const customers = await [...uniqueCustomerIds].map(async id => {

        //     const customer = await Customer.findOne({
        //         where: {
        //             id: id
        //         }
        //     })

        //     customer.dataValues.spend = await getCustomerSpend(customer)

        //     return customer
        // })

        // const customersResolved = await Promise.all(customers)
        // const topCustomers = [...customersResolved].sort((a, b) => { return b.dataValues.spend - a.dataValues.spend })

        team.dataValues.customerCount = uniqueCustomerIds.size
        // team.dataValues.topCusomers = topCustomers

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