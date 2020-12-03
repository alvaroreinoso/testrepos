'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, CustomerLocation, Lane, LanePartner, User, Location } = require('.././models');
const { Op } = require("sequelize");

module.exports.getLanesByCurrentUser = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {

        return {
            statusCode: 401
        }
    }

    try {
        const lanes = await user.getLanes({
            include: [{
                model: Location,
                required: true,
                as: 'origin',
                include: [{
                    model: CustomerLocation,
                    include: [{
                        model: Customer,
                        required: true,
                    }]
                },
                {
                    model: LanePartner
                }]
            }, {
                model: Location,
                required: true,
                as: 'destination',
                include: [{
                    model: CustomerLocation,
                    include: [{
                        model: Customer,
                        required: true,
                    }]
                },
                {
                    model: LanePartner
                }]
            }
            ]
        })

        return {
            statusCode: 200,
            body: JSON.stringify(lanes)
        }

    } catch (err) {
        console.log(err)

        return {
            statusCode: 500
        }
    }
}

module.exports.getLanesByUser = async (event, context) => {

    const targetUserId = event.pathParameters.id

    const currentUser = await getCurrentUser(event.headers.Authorization)

    if (currentUser.id == null) {

        return {
            statusCode: 401
        }
    }

    try {
        const targetUser = await User.findOne({
            where: {
                id: targetUserId,
                brokerageId: currentUser.brokerageId
            }
        })

        const userLanes = await targetUser.getLanes({
            include: [{
                model: Location,
                required: true,
                as: 'origin',
                include: [{
                    model: CustomerLocation,
                    include: [{
                        model: Customer,
                        required: true,
                    }]
                },
                {
                    model: LanePartner
                }]
            }, {
                model: Location,
                required: true,
                as: 'destination',
                include: [{
                    model: CustomerLocation,
                    include: [{
                        model: Customer,
                        required: true,
                    }]
                },
                {
                    model: LanePartner
                }]
            }
            ]
        })

        const customers = await targetUser.getCustomers()

        let lanesFromCustomers = []

        customers.forEach(async (customer) => {

            const cLanes = await Lane.findAll({
                order: [
                    ['frequency', 'DESC'],
                ],
                include: [{
                    model: Location,
                    as: 'origin',
                    required: true,
                    include: [{
                        model: CustomerLocation,
                        required: true,
                        include: [{
                            model: Customer,
                            required: true,
                            where: {
                                id: customer.id
                            }
                        }]
                    },
                    {
                        model: LanePartner
                    }]
                }, {
                    model: Location,
                    required: true,
                    as: 'destination',
                    include: [{
                        model: CustomerLocation,
                        include: [{
                            model: Customer,
                            required: true,
                            where: {
                                id: customer.id
                            }
                        }]
                    },
                    {
                        model: LanePartner
                    }]
                }]
            });

            lanesFromCustomers.push(cLanes)
        })

        const locations = await targetUser.getLocations()

        let lanesFromLocations = []

        locations.forEach(async (location) => {

            const locationId = location.id
            console.log(locationId)
            console.log('test')

            const lanes = await Lane.findAll({
                where: {
                    [Op.or]: [
                        { originLocationId: locationId },
                        { destinationLocationId: locationId }
                    ]
                },
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

            console.log(typeof lanes)

            lanesFromLocations.push(lanes)

        })

        const finalLanes = [...new Set([...userLanes,...lanesFromCustomers,...lanesFromLocations])]

        return {
            body: JSON.stringify(lanesFromLocations),
            statusCode: 200
        }

    } catch (err) {

        console.log(err)
        return {
            statusCode: 500
        }

    }
}

module.exports.getLaneById = async (event, context) => {

    const laneId = event.pathParameters.laneId

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401
        }
    }

    try {
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

        if (lane == null) {
            return {
                statusCode: 404
            }
        }

        return {
            body: JSON.stringify(lane),
            statusCode: 200
        }
    } catch {

        return {
            statusCode: 500
        }
    }
}

module.exports.updateLane = async (event, context) => {

    const request = JSON.parse(event.body)

    const laneId = event.pathParameters.laneId

    try {

        const lane = await Lane.findOne({
            where: {
                id: laneId
            }
        })

        lane.routeGeometry = request.routeGeometry
        lane.frequency = request.frequency
        lane.rate = request.rate

        if (lane.rate != null) {

            lane.userAddedRate = true

            await lane.save()

        } else {

            await lane.save()
        }

        return {
            statusCode: 204
        }

    } catch (err) {

        return {
            statusCode: 500
        }
    }
}
