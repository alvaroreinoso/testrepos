'use strict';
const { Customer, CustomerLocation, TaggedLane, Lane, LanePartner, Location, TaggedLocation } = require('.././models');
const { Op } = require("sequelize");
const getCurrentUser = require('.././helpers/user')
const getFrequency = require('.././helpers/getLoadFrequency').getFrequency
const corsHeaders = require('.././helpers/cors');

module.exports.getLocationById = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id === null) {
            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        const locationId = event.pathParameters.locationId

        const location = await Location.findOne({
            where: {
                id: locationId,
                brokerageId: user.brokerageId
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

        if (location === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        const lanes = await location.getLanes()

        if (lanes.length != 0) {

            const totalSpend = await lanes.reduce((a, b) => ({ spend: a.spend + b.spend }))

            const loadsPerMonthPerLane = await lanes.map( lane => {

                const loadsPerMonth = lane.frequency * 4

                return loadsPerMonth
            })

            const totalLoadsPerMonth = loadsPerMonthPerLane.reduce((a, b) => { return a + b })

            location.dataValues.loadsPerMonth = totalLoadsPerMonth
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
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id === null) {
            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }
        
        const request = JSON.parse(event.body)

        const location = await Location.findOne({
            where: {
                id: request.id,
                brokerageId: user.brokerageId
            }
        })

        if (location === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

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

        const location = await Location.findOne({
            where: {
                id: locationId,
                brokerageId: user.brokerageId
            }
        })

        if (location === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        const lanes = await Lane.findAll({
            attributes: ['id'],
            where: {
                [Op.or]: [
                    { originLocationId: locationId },
                    { destinationLocationId: locationId }
                ]
            },
        })

        const laneIds = new Set([...lanes].map(lane => lane.id))

        const uniqueLanes = await Promise.all([...laneIds].map(async laneId => {

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

            return lane
        }))

        return {
            body: JSON.stringify(uniqueLanes),
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
                id: locationId,
                brokerageId: user.brokerageId
            },
        })

        if (location === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

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
        const targetUserId = request.userId

        const targetUser = await User.findOne({
            where: {
                id: targetUserId,
                brokerageId: user.brokerageId
            }
        })

        const location = await Location.findOne({
            where: {
                id: locationId,
                brokerageId: user.brokerageId
            }
        })

        if (location === null || targetUser === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        await TaggedLocation.findOrCreate({
            where: {
                locationId: location.id,
                userId: targetUser.id
            }
        })

        const lanes = await location.getLanes()

        for (const lane of lanes) {

            await TaggedLane.findOrCreate({
                where: {
                    laneId: lane.id,
                    userId: targetUser.id
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
        const targetUserId = request.userId

        const location = await Location.findOne({
            where: {
                id: locationId,
                brokerageId: user.brokerageId
            }
        })

        const targetUser = await User.findOne({
            where: {
                id: targetUserId,
                brokerageId: user.brokerageId
            }
        })

        if (location === null || targetUser === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        await TaggedLocation.destroy({
            where: {
                userId: targetUser.id,
                locationId: location.id
            }
        })

        const lanes = await location.getLanes()

        for (const lane of lanes) {

            await TaggedLane.destroy({
                where: {
                    laneId: lane.id,
                    userId: targetUser.id
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