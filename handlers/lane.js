'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, CustomerLocation, Lane } = require('.././models')

module.exports.getLanesByCurrentUser = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    try {

        const lanes = await Lane.findAll({
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

module.exports.getLane = async (event, context) => {

    const lane_id = event.pathParameters.lane_id

    const results = await Lane.findOne({
        where: {
            id: lane_id
        }
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

};

module.exports.deleteLane = async (event, context) => {

    const lane_id = event.pathParameters.lane_id

    await Lane.destroy({
        where: {
            id: lane_id
        }
    })

    return {
        statusCode: 200,
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
