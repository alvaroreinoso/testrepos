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

        const results = await Location.findOne({
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

        return {
            body: JSON.stringify(results),
            statusCode: 200
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

    } catch(err) {
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