'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, Brokerage, CustomerLocation, LanePartner, Contact, LaneContact, Location, Lane } = require('.././models')
const { Op } = require("sequelize");

module.exports.getBrokerage = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401
        }
    }
}

module.exports.getLanesForBrokerage = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)
    const brokerageId = event.pathParameters.brokerageId

    if (user.id == null) {
        return {
            statusCode: 401
        }
    }

    if (user.brokerageId != brokerageId) {
        return {
            statusCode: 401
        }
    }

    try {

    const locations = await Location.findAll({
        include: [{
            model: CustomerLocation,
            required: true,
            include: [{
                model: Customer,
                required: true,
                where: {
                    brokerageId: brokerageId
                }
            }]
        }]
    })

    let lanes = []
        for (const location of locations) {
            const locationLanes = await Lane.findAll({
                where: {
                    [Op.or]: [
                        { originLocationId: location.id },
                        { destinationLocationId: location.id }
                    ]
                },
                order: [
                    ['frequency', 'DESC'],
                ],
                include: [{
                    model: Location,
                    as: 'origin',
                    include: [{
                        model: CustomerLocation,
                        include: [{
                            model: Customer,
                            required: true
                        }]
                    },
                    {
                        model: LanePartner
                    }],
                }, {
                    model: Location,
                    as: 'destination',
                    include: [{
                        model: CustomerLocation,
                        include: [{
                            model: Customer,
                            required: true
                        }]
                    },
                    {
                        model: LanePartner
                    }],
                }]
            })

            for (const lane of locationLanes) {
                lanes.push(lane)
            }
        }

        const laneSpend = lanes.map(lane => lane.spend)
        const teamSpend = await laneSpend.reduce((a, b) => a + b)

        const loadsPerWeek = await lanes.reduce((a, b) => ({ frequency: a.frequency + b.frequency }))

        const body = {
            revenue: teamSpend,
            loadsPerWeek: loadsPerWeek.frequency,
            Lanes: lanes
        }

    return {
        statusCode: 200,
        body: JSON.stringify(body)
    }
    } catch (err) {

        return {
            statusCode: 500
        }
    }
}