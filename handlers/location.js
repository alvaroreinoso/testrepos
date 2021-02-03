'use strict';
const { Customer, CustomerLocation, TaggedLane, Lane, LanePartner, Location, TaggedLocation } = require('.././models');
const { Op } = require("sequelize");
const { getCurrentUser } = require('.././helpers/user')
const getFrequency = require('.././helpers/getLoadFrequency').getFrequency
const corsHeaders = require('.././helpers/cors')

module.exports.getLocationById = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == undefined) {
            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        const locationId = event.pathParameters.locationId

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

            const totalSpend = await lanes.reduce((a, b) => ({ spend: a.spend + b.spend }))

            const loadsPerWeekPerLane = await lanes.map(async lane => {

                const frequency = await getFrequency(lane) // returns loads per week per lane

                if (frequency == 0) {
                    return 0
                }

                return frequency
            })

            const loadsResolved = await Promise.all(loadsPerWeekPerLane)
            const totalLoads = loadsResolved.reduce((a, b) => { return a + b })

            location.dataValues.loadsPerWeek = totalLoads
            location.dataValues.spendPerMonth = totalSpend.spend

            return {
                body: JSON.stringify(location),
                headers: corsHeaders,
                statusCode: 200
            }
        } else {

            location.dataValues.totalLoads = 0
            location.dataValues.spend = 0

            return {
                body: JSON.stringify(location),
                headers: corsHeaders,
                statusCode: 200
            }
        }
    }
    catch (err) {
        console.log(err)
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }

};

module.exports.editLocation = async (event, context) => {

    try {

        const request = JSON.parse(event.body)

        const location = await Location.findOne({
            where: {
                id: request.id
            }
        })

        location.hoursType = request.hoursType
        location.open = request.open
        location.close = request.close
        location.phone = request.phone
        location.email = request.email

        await location.save()

        return {
            headers: corsHeaders,
            statusCode: 204
        }

    } catch (err) {
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }
}

module.exports.getLanesForLocation = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == undefined) {
            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        const locationId = event.pathParameters.locationId

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
            headers: corsHeaders,
            statusCode: 200
        }

    } catch (err) {
        console.log(err)
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }

}

module.exports.getTeammatesForLocation = async (event, context) => {

    try {

        const user = await getCurrentUser(event.headers.Authorization)


        if (user.id == null) {
            return {
                headers: corsHeaders,
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
            headers: corsHeaders,
            statusCode: 200
        }
    }
    catch (err) {

        console.log(err)
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }


}

module.exports.addTeammateToLocation = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                headers: corsHeaders,
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
            headers: corsHeaders,
            statusCode: 204
        }
    }
    catch (err) {
        console.log(err)
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }
}

module.exports.deleteTeammateFromLocation = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                headers: corsHeaders,
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

        await TaggedLocation.destroy({
            where: {
                userId: userId,
                locationId: locationId
            }
        })

        const lanes = await location.getLanes()

        for (const lane of lanes) {

            await TaggedLane.destroy({
                where: {
                    laneId: lane.id,
                    userId: userId
                }
            })
        }

        return {
            headers: corsHeaders,
            statusCode: 204
        }
    }
    catch (err) {
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }
}