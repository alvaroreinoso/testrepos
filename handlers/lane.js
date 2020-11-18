'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, CustomerLocation, Lane, LanePartner, User, Location } = require('.././models');

module.exports.getLanesByCurrentUser = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {

        return {
            statusCode: 401
        }
    }

    try {

        const lanes = await Lane.findAll({
            include: [{
                model: Location,
                as: 'origin',
                include: [{
                    model: CustomerLocation,
                    include: [{
                        model: Customer,
                        required: true,
                        where: {
                            userId: user.id
                        }
                    }]
                },
                {
                    model: LanePartner
                }]
            }, {
                model: Location,
                as: 'destination',
                include: [{
                    model: CustomerLocation,
                    include: [{
                        model: Customer,
                        required: true,
                        where: {
                            userId: user.id
                        }
                    }]
                },
                {
                    model: LanePartner
                }]
            }
            ]
        });

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

        const lanes = await Lane.findAll({
            include: [{
                model: Location,
                as: 'origin',
                include: [{
                    model: CustomerLocation,
                    include: [{
                        model: Customer,
                        required: true,
                        where: {
                            userId: targetUser.id
                        }
                    }]
                },
                {
                    model: LanePartner
                }]
            }, {
                model: Location,
                as: 'destination',
                include: [{
                    model: CustomerLocation,
                    include: [{
                        model: Customer,
                        required: true,
                        where: {
                            userId: targetUser.id
                        }
                    }]
                },
                {
                    model: LanePartner
                }]
            }
            ]
        });

        return {
            body: JSON.stringify(lanes),
            statusCode: 200
        }

    } catch (err) {

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
            }
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

        await lane.save()

        return {
            statusCode: 204
        }

    } catch (err) {

        return {
            statusCode: 500
        }

    }
}
