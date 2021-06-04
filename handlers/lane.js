'use strict';
const getCurrentUser = require('.././helpers/user')
const { Customer, CustomerLocation, Carrier, Lane, Load, LanePartner, User, Location, MarketFeedback, TaggedLane, Team } = require('.././models');
const query = require('.././helpers/getLanes')
const corsHeaders = require('.././helpers/cors')
const { showLaneOnMap } = require('../helpers/showLaneOnMap')
const sequelize = require('sequelize');
const { getLngLat, getRoute } = require('../helpers/mapbox');

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
        const status = event.queryStringParameters.status

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

        const showOnMap = await showLaneOnMap(lane, status)

        if (showOnMap === false) {
            lane.dataValues.routeGeometry = null

            return {
                body: JSON.stringify(lane),
                statusCode: 200,
                headers: corsHeaders
            }
        } else if (showOnMap === true) {
            return {
                body: JSON.stringify(lane),
                statusCode: 200,
                headers: corsHeaders
            }
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

        // const carriers = await Carrier.findAll({
        //     include: [{
        //         model: Load,
        //         where: {
        //             laneId: lane.id
        //         }
        //     }],
        // });

        // const carriersWithCount = await carriers.map(carrier => {
        //     carrier.dataValues.loadCount = carrier.Loads.length
        //     carrier.dataValues.historicalRate = carrier.Loads[0].rate

        //     delete carrier.dataValues.Loads

        //     return carrier
        // })

        // const topCarriers = await carriersWithCount.sort((a, b) => b.loadCount - a.loadCount)

        const topCarriers = await lane.getCarriers()

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

module.exports.addLane = async (event, context) => {
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

        if (request.inbound === true) {
            const destination = await Location.findOne({
                where: {
                    id: request.locationId
                }
            })

            if (destination === null) {
                return {
                    statusCode: 422,
                    headers: corsHeaders
                }
            }

            const originLnglat = await getLngLat(request.city)

            const origin = await Location.create({
                brokerageId: user.brokerageId,
                address: request.address,
                address2: request.address2,
                city: request.city,
                state: request.state,
                lnglat: originLnglat
            })

            await LanePartner.create({
                locationId: origin.id
            })

            const [route, mileage] = await getRoute(origin.lnglat, destination.lnglat)

            const lane = await Lane.create({
                brokerageId: user.brokerageId,
                originLocationId: origin.id,
                destinationLocationId: destination.id,
                routeGeometry: route,
                mileage: mileage,
                inbound: true
            })

            await TaggedLane.create({
                laneId: lane.id,
                userId: user.id
            })

            return {
                statusCode: 201,
                body: JSON.stringify(lane),
                headers: corsHeaders
            }

        } else {
            const origin = await Location.findOne({
                where: {
                    id: request.locationId
                }
            })

            if (origin === null) {
                return {
                    statusCode: 422,
                    headers: corsHeaders
                }
            }

            const destinationLnglat = await getLngLat(request.city)

            const destination = await Location.create({
                brokerageId: user.brokerageId,
                address: request.address,
                address2: request.address2,
                city: request.city,
                state: request.state,
                lnglat: destinationLnglat
            })

            await LanePartner.create({
                locationId: destination.id
            })

            const [route, mileage] = await getRoute(origin.lnglat, destination.lnglat)

            const lane = await Lane.create({
                brokerageId: user.brokerageId,
                originLocationId: origin.id,
                destinationLocationId: destination.id,
                routeGeometry: route,
                mileage: mileage,
                inbound: false
            })

            await TaggedLane.create({
                laneId: lane.id,
                userId: user.id
            })

            return {
                statusCode: 201,
                body: JSON.stringify(lane),
                headers: corsHeaders
            }
        }
    } catch (err) {
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
        lane.rate = request.rate
        lane.requirements = request.requirements
        lane.painPoints = request.painPoints
        lane.competitionAnalysis = request.competitionAnalysis

        // if the user has updated the currentVolume, also update potentialVolume
        if(lane.currentVolume !== request?.currentVolume) {
            console.log('current volume updated')
            lane.currentVolume = request.currentVolume
            lane.potentialVolume = lane.currentVolume + lane.opportunityVolume

            if (lane.currentVolume !== 0) {

                lane.owned = true
            }

            await lane.save()
    
            return {
                statusCode: 204,
                headers: corsHeaders
            }
        }

        // if the user has updated the opportunity, also update the totalPotential
        if(lane.opportunityVolume !== request?.opportunityVolume) {
            lane.opportunityVolume = request.opportunityVolume
            lane.potentialVolume = lane.opportunityVolume + lane.currentVolume

            await lane.save()
    
            return {
                statusCode: 204,
                headers: corsHeaders
            }
        }

        //if the user has updated the potential, also update the opportunity
        if(lane.potentialVolume !== request?.potentialVolume) {

            lane.potentialVolume = request.potentialVolume
            lane.opportunityVolume = lane.potentialVolume - lane.currentVolume

            await lane.save()
    
            return {
                statusCode: 204,
                headers: corsHeaders
            }
        }

        await lane.save()

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
                serviceRating: request.serviceRating,
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

            carrier.serviceRating = request.serviceRating
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
