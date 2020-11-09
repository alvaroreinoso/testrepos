'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, CustomerLocation, Lane, LanePartner, CustomerLane, User } = require('.././models');

module.exports.getLanesByCurrentUser = async (event, context) => {

    try {

        const user = await getCurrentUser(event.headers.Authorization)

        const lanes = await CustomerLane.findAll({
            include: [{
                model: CustomerLocation,
                required: true,
                include: [{
                    model: Customer,
                    required: true,
                    where: {
                        userId: user.id
                    }
                }]
            }, {
                model: LanePartner,
                required: true
            }]
        });

        return {
            statusCode: 200,
            body: JSON.stringify(lanes)
        }

    } catch (err) {

        return {
            statusCode: 401
        }
    }
}

module.exports.getLanesByUser = async (event, context) => {

    const targetUserId = event.pathParameters.id

    const currentUser = await getCurrentUser(event.headers.Authorization)

    try {
        const targetUser = await User.findOne({
            where: {
                id: targetUserId,
                brokerageId: currentUser.brokerageId
            }
        })

        const lanes = await CustomerLane.findAll({
            include: [{
                model: CustomerLocation,
                required: true,
                include: [{
                    model: Customer,
                    required: true,
                    where: {
                        userId: targetUser.id
                    }
                }]
            }, {
                model: LanePartner,
                required: true
            }]
        });

        return {
            body: JSON.stringify(lanes),
            statusCode: 200
        }

    } catch (err) {

        return {
            statusCode: 401
        }

    }
}

module.exports.getCustomerLaneById = async (event, context) => {

    try {

        const user = await getCurrentUser(event.headers.Authorization)

        const laneId = event.pathParameters.laneId

        const results = await CustomerLane.findOne({
            where: {
                id: laneId
            },
            include: [{
                model: CustomerLocation,
                required: true,
                include: [{
                    model: Customer,
                    required: true,
                    where: {
                        userId: user.id
                    }
                }]
            }, {
                model: LanePartner,
                required: true
            }]
        })

        if (results != null) {
            return {
                statusCode: 200,
                body: JSON.stringify(results)
            }
        } else {
            return {
                statusCode: 404
            }
        }
    }
    catch (err) {

        return {
            statusCode: 401
        }
    }

};

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

module.exports.deleteLane = async (event, context) => {


    const laneId = event.pathParameters.laneId

    const user = await getCurrentUser(event.headers.Authorization)

    try {

        const lane = await CustomerLane.findOne({
            where: {
                id: laneId
            },
            include: [{
                model: CustomerLocation,
                required: true,
                include: [{
                    model: Customer,
                    required: true,
                    where: {
                        userId: user.id
                    }
                }]
            }, {
                model: LanePartner,
                required: true
            }]
        })

        if (lane === null) {
            return {
                statusCode: 404
            }
        }

        else {

            lane.destroy()

            return {
                statusCode: 200,
            }


        }

    }
    catch (err) {

        return {
            statusCode: 401
        }
    }

};

module.exports.addLane = async (event, context) => {

    const req = (JSON.parse(event.body))

    try {
        const lane = await Lane.create({
            customerLocationId: req.customerLocationId,
            lanePartnerLocationId: req.lanePartnerLocationId,
            customerIsShipper: req.customerIsShipper
        })

        return {
            statusCode: 204,
            body: JSON.stringify(lane)
        }

    } catch (err) {

        return {
            statusCode: 500
        }

    }
}

module.exports.updateLane = async (event, context) => {

    const request = JSON.parse(event.body)

    const laneId = event.pathParameters.laneId

    try {

        const lane = await CustomerLane.findOne({
            where: {
                id: laneId
            }
        })

        lane.customerLocationId = request.customerLocationId
        lane.lanePartnerId = request.lanePartnerId
        lane.laneId = request.laneId
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

module.exports.getCustomerLanesForLane = async (event, context) => {

    const laneId = event.pathParameters.id

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401
        }
    }

    try {

        const results = await Lane.findOne({
            where: {
                id: laneId
            },
            include: [{
                model: CustomerLane,
                required: true
            }]
        })

        if (results == null) {
            return {
                statusCode: 404
            }
        }

        return {
            body: JSON.stringify(results),
            statusCode: 200
        }
    } catch {

        return {
            statusCode: 500
        }
    }

}
