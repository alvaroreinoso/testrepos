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

        let customerIds = []
        let laneIds = []
        teammates.forEach(teammate => {
            teammate.Customers.forEach(cust => {
                customerIds.push(cust.id)

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
                for (const locLane of loc.Lanes) {
                    laneIds.push(locLane.id)
                }
            })
        })

        const uniqueLaneIds = new Set(laneIds)
        const lanes = await [...uniqueLaneIds].map(async laneId => {

            const lane = await Lane.findOne({
                where: {
                    id: laneId
                },
            })
            return lane
        })

        const lanesResolved = await Promise.all(lanes)
        const laneSpend = lanesResolved.map(lane => lane.spend)
        const teamSpend = await laneSpend.reduce((a, b) => a + b)
        team.dataValues.revenue = teamSpend

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

        const loadsPerWeek = await lanesResolved.reduce((a, b) => ({ frequency: a.frequency + b.frequency }))
        team.dataValues.loadsPerWeek = loadsPerWeek.frequency

        team.dataValues.topCustomers = topCustomers

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

        const response = {
            body: JSON.stringify(lanesResolved),
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