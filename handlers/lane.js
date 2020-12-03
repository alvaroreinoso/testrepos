'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, CustomerLocation, Lane, LanePartner, User, Location } = require('.././models');
const { Op } = require("sequelize");
const query = require('.././helpers/getLanes')

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

        const userLanes = await targetUser.getLanes()
        const customers = await targetUser.getCustomers()
        const locations = await targetUser.getLocations()
        
        const laneIdsFromUser = userLanes.map(lane => lane.id)
        const laneIdsFromLocations = await query.getLanesFromLocations(locations)
        const laneIdsFromCustomers = await query.getLanesFromCustomers(customers)
        
        const laneIds = [...new Set([...laneIdsFromUser,...laneIdsFromCustomers,...laneIdsFromLocations])]

        const allTaggedLanes = await query.getLanesFromIds(laneIds)

        return {
            body: JSON.stringify(allTaggedLanes),
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
