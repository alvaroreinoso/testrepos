'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { User, Team, Brokerage, Customer, CustomerLocation, Lane } = require('.././models')



module.exports.getLanesByCurrentUser = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)
    console.log(user.id)

    const customers = await Customer.findAll({
        where: {
            userId: 1 //user.id
        },
        include: [{
            model: CustomerLocation,
            required: true,
            include: [{
                model: Lane,
                required: true

            }]
        }]
    })

    console.log(customers.length)
    if (customers.length != 0) {
        const locations = await customers.map(cust => cust.CustomerLocations)
        const lanes = await locations[0].map(loc => loc.Lanes)

        return {
            statusCode: 200,
            body: JSON.stringify(lanes)
        }
    }
    else {
        return {
            statusCode: 404
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
    return {
        statusCode: 200,
        body: JSON.stringify(results)
    }
};

module.exports.deleteLane = async (event, context) => {

    console.log(event.pathParameters)

    const lane_id = event.pathParameters.lane_id

    try {
    await Lane.destroy({
        where: {
            id: lane_id
        }
    })

    return {
        statusCode: 200,
    }
    }
    catch {
        return {
            statusCode: 404
        }
    }
};

module.exports.addLane = async (event, context) => {

    const req = (JSON.parse(event.body))

    const lane = await Lane.build({ 
        customerLocationId: req.customerLocationId,
        lanePartnerLocationId: req.lanePartnerLocationId,
        customerIsShipper: req.customerIsShipper
    },
    {
        returning: true
    })

    lane.save()

    return {
        statusCode: 204,
        body: JSON.stringify(lane)
    }
}
