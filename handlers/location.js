'use strict';
const { Customer, CustomerLocation, TaggedLane, Lane, LanePartner, Location, TaggedLocation } = require('.././models');
const { Op } = require("sequelize");
const { getCurrentUser } = require('.././helpers/user')

module.exports.getLocationById = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == undefined) {
            return {
                statusCode: 401
            }
        }

        const locationId = event.pathParameters.id

        const location = await Location.findOne({
            where: {
                id: locationId
            },
            include: [
                {
                    model: CustomerLocation,
                    include: [{
                        model: Customer,
                        required: true
                    }]
                },
                {
                    model: LanePartner,
                }]
        })

        const lanes = await location.getLanes()

        if (lanes.length != 0) {

            const lanesWithSpend = await lanes.map(lane => {

                const spend = lane.frequency * lane.rate

                lane.dataValues.spend = spend

                return lane.dataValues
            })

            const lanesResolved = await Promise.all(lanesWithSpend)

            const totalSpend = await lanesResolved.reduce((a, b) => ({ spend: a.spend + b.spend }))
            const totalLanes = lanesResolved.length

            location.dataValues.spend = totalSpend.spend
            location.dataValues.laneCount = totalLanes

            return {
                body: JSON.stringify(location),
                statusCode: 200
            }
        } else {

            return {
                body: JSON.stringify(location),
                statusCode: 200
            }

        }
    }
    catch (err) {
        console.log(err)
        return {
            statusCode: 500
        }
    }

};

module.exports.getLanesForLocation = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == undefined) {
            return {
                statusCode: 401
            }
        }

        const locationId = event.pathParameters.id

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

        return {
            body: JSON.stringify(lanes),
            statusCode: 200
        }

    } catch (err) {
        console.log(err)
        return {
            statusCode: 500
        }
    }

}

module.exports.getTeammatesForLocation = async (event, context) => {

    try {

        const user = await getCurrentUser(event.headers.Authorization)


        if (user.id == null) {
            return {
                statusCode: 401
            }
        }

        const locationId = event.pathParameters.locationId

        const location = await Location.findOne({
            where: {
                id: locationId
            },
        })

        const users = await location.getUsers()

        return {
            body: JSON.stringify(users),
            statusCode: 200
        }
    }
    catch (err) {

        console.log(err)
        return {
            statusCode: 500
        }
    }


}

module.exports.addTeammateToLocation = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401
            }
        }

        const request = JSON.parse(event.body)

        const locationId = request.locationId
        const userId = request.userId

        const location = await Location.findOne({
            where: {
                id: locationId
            }
        })

        await TaggedLocation.findOrCreate({
            where: {
                locationId: locationId,
                userId: userId
            }
        })

        const lanes = await location.getLanes()

        for (const lane of lanes) {

            await TaggedLane.findOrCreate({
                where: {
                    laneId: lane.id,
                    userId: userId
                }
            })
        }

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

module.exports.deleteTeammateFromLocation = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401
            }
        }

        const request = JSON.parse(event.body)

        await TaggedLocation.destroy({
            where: {
                userId: request.userId,
                locationId: request.locationId
            }
        })

        return {
            statusCode: 204
        }
    }
    catch (err) {
        return {
            statusCode: 500
        }
    }
}