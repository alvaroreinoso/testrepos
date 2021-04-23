'use strict';
const getCurrentUser = require('.././helpers/user')
const { Customer, CustomerLocation, Carrier, Lane, Load, LanePartner, User, Location, MarketFeedback, TaggedLane, Team } = require('.././models');
const query = require('.././helpers/getLanes')
const corsHeaders = require('.././helpers/cors')
const sequelize = require('sequelize')

module.exports.getLanesByUser = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

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

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

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

        if (lane === null) {
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
        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.getTopCarriers = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

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

            delete carrier.dataValues.Loads

            return carrier
        })

        const topCarriers = await carriersWithCount.sort((a, b) => b.loadCount - a.loadCount)

        return {
            body: JSON.stringify(topCarriers),
            headers: corsHeaders,
            statusCode: 200
        }
    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.updateLane = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401,
                headers: corsHeaders
            }
        }

        const request = JSON.parse(event.body)
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

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401
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

        const feedback = await MarketFeedback.findAll({
            where: {
                laneId: lane.id
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

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

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

        const request = JSON.parse(event.body)

        await MarketFeedback.create({
            laneId: lane.id,
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

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

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

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

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
            },
            include: {
                model: User,
                through: { attributes: [] },
                include: {
                    model: Team
                }
            }
        })

        if (lane === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        return {
            body: JSON.stringify(lane.Users),
            statusCode: 200,
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

module.exports.addTeammateToLane = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

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

        const lane = await Lane.findOne({
            where: {
                id: laneId,
                brokerageId: user.brokerageId
            }
        })

        const targetUserId = request.userId

        const targetUser = await User.findOne({
            where: {
                id: targetUserId,
                brokerageId: user.brokerageId
            }
        })

        if (lane === null || targetUser === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        await TaggedLane.findOrCreate({
            where: {
                laneId: lane.id,
                userId: targetUser.id
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

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401,
                headers: corsHeaders
            }
        }

        const request = JSON.parse(event.body)

        const lane = await Lane.findOne({
            where: {
                id: request.laneId,
                brokerageId: user.brokerageId
            }
        })

        const targetUser = await User.findOne({
            where: {
                id: request.userId,
                brokerageId: user.brokerageId
            }
        })

        if (lane === null || targetUser === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        await TaggedLane.destroy({
            where: {
                userId: targetUser.id,
                laneId: lane.id
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

module.exports.addCarrier = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401,
                headers: corsHeaders
            }
        }

        const request = JSON.parse(event.body)

        const laneId = event.pathParameters.laneId

        const lane = await Lane.findOne({
            where: {
                id: laneId
            }
        })

        if (lane === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        if (lane.brokerageId != user.brokerageId) {
            return {
                statusCode: 403,
                headers: corsHeaders
            }
        }

        if (event.httpMethod === 'POST') {

            const carrier = await Carrier.create({
                name: request.name,
                laneId: laneId,
                mcn: request.mcn,
                historicalRate: request.historicalRate,
                contactEmail: request.contactEmail,
                contactPhone: request.contactPhone,
                contactName: request.contactName,
            })
    
            return {
                statusCode: 204,
                headers: corsHeaders
            }
        }

        if (event.httpMethod === 'PUT') {

            const carrier = await Carrier.findOne({
                where: {
                    id: request.id
                }
            })
    
            carrier.name = request.name
            carrier.mcn = request.mcn
            carrier.historicalRate = request.historicalRate
            carrier.contactEmail = request.contactEmail
            carrier.contactPhone = request.contactPhone
            carrier.contactName = request.contactName
    
            await carrier.save()
        }

        return {
            statusCode: 204,
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