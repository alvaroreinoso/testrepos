'use strict';
const { Customer, CustomerLocation, TaggedLane, Lane, LanePartner, Location, TaggedLocation, User, Team } = require('.././models');
const { Op } = require("sequelize");
const getCurrentUser = require('.././helpers/user')
const corsHeaders = require('.././helpers/cors');
const { getLngLat, parseLocation } = require('../helpers/mapbox');
const { getStatusQueryOperator } = require('../helpers/getStatusQueryOperator');
const { getHiddenPotentialForLocation } = require('../helpers/getPotentialForOwnedLanes');
const { getLaneWhereOptionsByStatus } = require('../helpers/getLaneWhereOptionsByStatus');

module.exports.getLocationById = async (event, context) => {
    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

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
            include:
            {
                model: CustomerLocation,
                required: true,
                include: [{
                    model: Customer,
                    required: true
                }]
            }
        })

        if (location === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        return {
            body: JSON.stringify(location),
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

};

module.exports.addLocation = async (event, context) => {
    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == undefined) {
            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        const request = JSON.parse(event.body)

        const address = parseLocation(request)
        const lnglat = await getLngLat(address)

        const location = await Location.create({
            brokerageId: user.brokerageId,
            address: request.address,
            address2: request.address2,
            city: request.city,
            state: request.state,
            zipcode: request.zipcode,
            isHQ: false,
            owned: false,
            lnglat: lnglat
        })

        await TaggedLocation.create({
            userId: user.id,
            locationId: location.id
        })

        const customerLocation = await CustomerLocation.create({
            customerId: request.customerId,
            locationId: location.id
        })

        return {
            statusCode: 201,
            headers: corsHeaders,
            body: JSON.stringify(location)
        }
    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.updateLocation = async (event, context) => {
    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id === null) {
            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        const locationId = event.pathParameters.locationId
        const request = JSON.parse(event.body)

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

        if (event.httpMethod === 'DELETE') {
            await location.destroy()

            return {
                statusCode: 204,
                headers: corsHeaders
            }
        }

        location.hoursType = request.hoursType
        location.open = request.open
        location.close = request.close
        location.phone = request.phone
        location.email = request.email
        location.estimatedVolume = request.estimatedVolume
        location.estimatedSpend = request.estimatedSpend
        location.requirements = request.requirements
        location.painPoints = request.painPoints
        location.competitionAnalysis = request.competitionAnalysis

        await location.save()

        return {
            headers: corsHeaders,
            statusCode: 204
        }

    } catch (err) {
        console.log(err)
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }
}

module.exports.getLanesForLocation = async (event, context) => {
    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

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

        const status = event.queryStringParameters.status
        const laneWhereOptions = getLaneWhereOptionsByStatus(status)

        const originLanes = await Lane.findAll({
            where: [
                laneWhereOptions,
                {
                    originLocationId: locationId
                },
            ],
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

        const destinationLanes = await Lane.findAll({
            where: [
                laneWhereOptions,
                {
                    destinationLocationId: locationId
                }
            ],
         
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

        const lanes = originLanes.concat(destinationLanes)

        if (lanes.length == 0) {
            const body = {
                loadsPerMonth: 0,
                spend: 0,
                Lanes: []
            }

            return {
                body: JSON.stringify(body),
                statusCode: 200,
                headers: corsHeaders
            }
        }

        switch (status) {
            case 'owned': {
                const sortedLanes = await lanes.sort((a, b) => b.spend - a.spend)

                const totalSpend = await lanes.reduce((a, b) => ({ spend: a.spend + b.spend }))

                const loadsPerMonth = await lanes.reduce((a, b) => ({ currentVolume: a.currentVolume + b.currentVolume }))

                const body = {
                    loadsPerMonth: loadsPerMonth.currentVolume,
                    spend: totalSpend.spend,
                    Lanes: sortedLanes
                }

                return {
                    body: JSON.stringify(body),
                    statusCode: 200,
                    headers: corsHeaders
                }
            } case 'opportunities': {
                // const ownedLanePotential = await getHiddenPotentialForLocation(location)

                const sortedLanes = await lanes.sort((a, b) => b.opportunitySpend - a.opportunitySpend)
                const totalSpend = await lanes.reduce((a, b) => ({ opportunitySpend: a.opportunitySpend + b.opportunitySpend }))

                const loadsPerMonth = await lanes.reduce((a, b) => ({ opportunityVolume: a.opportunityVolume + b.opportunityVolume }))

                const totalOpportunitySpend = totalSpend.opportunitySpend

                const body = {
                    loadsPerMonth: loadsPerMonth.opportunityVolume,
                    spend: totalOpportunitySpend,
                    Lanes: sortedLanes
                }

                return {
                    body: JSON.stringify(body),
                    statusCode: 200,
                    headers: corsHeaders
                }

            } case 'potential': {
                const sortedLanes = await lanes.sort((a, b) => b.potentialSpend - a.potentialSpend)

                const totalSpend = await lanes.reduce((a, b) => ({ potentialSpend: a.potentialSpend + b.potentialSpend }))

                const loadsPerMonth = await lanes.reduce((a, b) => ({ potentialVolume: a.potentialVolume + b.potentialVolume }))

                const body = {
                    loadsPerMonth: loadsPerMonth.potentialVolume,
                    spend: totalSpend.potentialSpend,
                    Lanes: sortedLanes
                }

                return {
                    body: JSON.stringify(body),
                    statusCode: 200,
                    headers: corsHeaders
                }
            }
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

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

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
            include: {
                model: User,
                include: {
                    model: Team
                }
            }
        })

        if (location === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        return {
            body: JSON.stringify(location.Users),
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

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

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

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

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