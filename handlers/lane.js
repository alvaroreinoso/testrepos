'use strict';
const getCurrentUser = require('.././helpers/user')
const { Customer, CustomerLocation, Carrier, Lane, Load, LanePartner, User, Location, MarketFeedback, TaggedLane } = require('.././models');
const query = require('.././helpers/getLanes')
const corsHeaders = require('.././helpers/cors')
const sequelize = require('sequelize')

module.exports.getLanesByUser = async (event, context) => {

    const targetUserId = event.pathParameters.id

    const currentUser = await getCurrentUser(event.headers.Authorization)

    if (currentUser.id == null) {
        return {
            statusCode: 401,
            headers: corsHeaders
        }
    }

    try {
        const targetUser = await User.findOne({
            where: {
                id: targetUserId,
            }
        })

        if (targetUser == null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        if (targetUser.brokerageId != currentUser.brokerageId) {
            return {
                statusCode: 401,
                headers: corsHeaders
            }
        }

        const userLanes = await targetUser.getLanes()
        const customers = await targetUser.getCustomers()
        const locations = await targetUser.getLocations()

        const laneIdsFromUser = userLanes.map(lane => lane.id)
        const laneIdsFromLocations = await query.getLanesFromLocations(locations)
        const laneIdsFromCustomers = await query.getLanesFromCustomers(customers)

        const laneIds = [...new Set([...laneIdsFromUser, ...laneIdsFromCustomers, ...laneIdsFromLocations])]

        const allTaggedLanes = await query.getLanesFromIds(laneIds)

        return {
            body: JSON.stringify(allTaggedLanes),
            statusCode: 200,
            headers: corsHeaders
        }

    } catch (err) {

        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.getLaneById = async (event, context) => {

    const laneId = event.pathParameters.laneId

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401,
            headers: corsHeaders
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
                statusCode: 404,
                headers: corsHeaders
            }
        }

        return {
            body: JSON.stringify(lane),
            statusCode: 200,
            headers: corsHeaders
        }
    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.getTopCarriers = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401,
                headers: corsHeaders
            }
        }

        const laneId = event.pathParameters.laneId

        const lane = await Lane.findOne({
            where: {
                id: laneId,
                brokerageId: user.brokerageId
            }
        })

        if (lane === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        const carriers = await Carrier.findAll({
            include: [{
                model: Load,
                where: {
                    laneId: lane.id
                }
            }],
        });

        const carriersWithCount = await carriers.map(carrier => {
            carrier.dataValues.loadCount = carrier.Loads.length
            carrier.dataValues.historicalRate = carrier.Loads[0].rate

            return carrier
        })

        const topCarriers = await carriersWithCount.sort((a, b) => b.loadCount - a.loadCount)

        return {
            body: JSON.stringify(topCarriers),
            headers: corsHeaders,
            statusCode: 200
        }

        // find lane 

        // get loads

        // count loads by carrier

        // if (lane === null) {
        //     return {
        //         statusCode: 404
        //     }
        // }

        // const loads = await lane.getLoads({
        //     include: [{
        //         model: Carrier,
        //         required: true
        //     }]
        // })

        // const carriers = await loads.map(load => load.Carrier.name)

        // let counts = {}

        // for (let i = 0; i < carriers.length; i++) {
        //     let num = carriers[i];
        //     counts[num] = counts[num] ? counts[num] + 1 : 1;
        // }

        // const sorted = Object.fromEntries(
        //     Object.entries(counts).sort(([,a],[,b]) => b-a)
        // );

        // const topCarriers = Object.keys(sorted).map(async item => {

        //     const carrier = await Carrier.findOne({
        //         where: {
        //             name: item
        //         },
        //     })

        //     const loads = await carrier.getLoads()

        //     const rates = await loads.map(load => load.rate)
        //     const rateSum = await rates.reduce((a, b) => { return a + b })
        //     const historicalRate = rateSum / rates.length

        //     carrier.dataValues.historicalRate = historicalRate

        //     return carrier
        // })

        // const results = await Promise.all(topCarriers)

        // return {
        //     body: JSON.stringify(results),
        //     statusCode: 200,
        //     headers: corsHeaders
        // }
    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            headers: corsHeaders
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
            statusCode: 204,
            headers: corsHeaders
        }

    } catch (err) {

        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.getMarketFeedback = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401
        }
    }

    try {
        const laneId = event.pathParameters.laneId

        const feedback = await MarketFeedback.findAll({
            where: {
                laneId: laneId
            }
        })

        return {
            body: JSON.stringify(feedback),
            statusCode: 200,
            headers: corsHeaders
        }
    } catch (err) {

        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.addMarketFeedback = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401,
            headers: corsHeaders
        }
    }

    try {
        const laneId = event.pathParameters.laneId

        const request = JSON.parse(event.body)

        await MarketFeedback.create({
            laneId: laneId,
            rate: request.rate,
            motorCarrierNumber: request.motorCarrierNumber,
        })

        return {
            statusCode: 204,
            headers: corsHeaders
        }
    } catch (err) {

        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.deleteMarketFeedback = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401,
            headers: corsHeaders
        }
    }

    try {
        const laneId = event.pathParameters.laneId

        const feedbackId = event.pathParameters.feedbackId

        await MarketFeedback.destroy({
            where: {
                id: feedbackId,
                laneId: laneId
            }
        })

        return {
            statusCode: 204,
            headers: corsHeaders
        }

    } catch (err) {

        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.getTeammatesForLane = async (event, context) => {

    try {

        const user = await getCurrentUser(event.headers.Authorization)


        if (user.id == null) {
            return {
                statusCode: 401,
                headers: corsHeaders
            }
        }

        const laneId = event.pathParameters.laneId

        const lane = await Lane.findOne({
            where: {
                id: laneId
            },
        })

        const users = await lane.getUsers()

        return {
            body: JSON.stringify(users),
            statusCode: 200,
            headers: corsHeaders
        }
    }
    catch (err) {

        console.log(err)
        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }


}

module.exports.addTeammateToLane = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401,
                headers: corsHeaders
            }
        }

        const request = JSON.parse(event.body)

        const laneId = request.laneId
        const userId = request.userId

        await TaggedLane.findOrCreate({
            where: {
                laneId: laneId,
                userId: userId
            }
        })

        return {
            statusCode: 204,
            headers: corsHeaders
        }
    }
    catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.deleteTeammateFromLane = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401,
                headers: corsHeaders
            }
        }

        const request = JSON.parse(event.body)

        await TaggedLane.destroy({
            where: {
                userId: request.userId,
                laneId: request.laneId
            }
        })

        return {
            statusCode: 204,
            headers: corsHeaders
        }
    }
    catch (err) {
        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}