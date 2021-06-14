'use strict';
const getCurrentUser = require('.././helpers/user')
const { Customer, TaggedLane, TaggedLocation, CustomerContact, CustomerLocation, Team, TaggedCustomer, LanePartner, Location, Lane, User, sequelize } = require('.././models')
const { Op } = require("sequelize");
const corsHeaders = require('.././helpers/cors')
const { getLngLat, parseLocation } = require('.././helpers/mapbox')
const { getStatusQueryOperator } = require('../helpers/getStatusQueryOperator')
const { getHiddenPotentialForCustomer } = require('../helpers/getPotentialForOwnedLanes');
const { getLaneWhereOptionsByStatus } = require('../helpers/getLaneWhereOptionsByStatus');

module.exports.addCustomer = async (event, context) => {
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

        const customer = await Customer.create({
            brokerageId: user.brokerageId,
            name: request.name,
            displayName: request.name
        })

        await TaggedCustomer.create({
            customerId: customer.id,
            userId: user.id
        })

        const address = parseLocation(request)
        const lnglat = await getLngLat(address)

        const hqLocation = await Location.create({
            owned: false,
            isHQ: true,
            brokerageId: user.brokerageId,
            address: request.address,
            address2: request.address2,
            city: request.city,
            state: request.state,
            lnglat: lnglat
        })

        await TaggedLocation.create({
            locationId: hqLocation.id,
            userId: user.id
        })

        const hq = await CustomerLocation.create({
            customerId: customer.id,
            locationId: hqLocation.id
        })

        return {
            statusCode: 201,
            body: JSON.stringify(customer),
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

module.exports.updateCustomer = async (event, context) => {
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

        const customerId = event.pathParameters.customerId
        const request = JSON.parse(event.body)

        const customer = await Customer.findOne({
            where: {
                id: customerId,
                brokerageId: user.brokerageId
            }
        })

        if (customer == null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        customer.bio = request.bio
        customer.email = request.email
        customer.displayName = request.displayName
        customer.phone = request.phone
        customer.logo = request.logo
        customer.estimatedVolume = request.estimatedVolume
        customer.estimatedSpend = request.estimatedSpend
        customer.requirements = request.requirements
        customer.painPoints = request.painPoints
        customer.competitionAnalysis = request.competitionAnalysis

        await customer.save()

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

module.exports.getCustomer = async (event, context) => {

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
        const customerId = event.pathParameters.customerId

        const customer = await Customer.findOne({
            where: {
                id: customerId,
                brokerageId: user.brokerageId
            }
        })

        if (customer === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify(customer),
            headers: corsHeaders
        }

    } catch (err) {
        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.getLanesForCustomer = async (event, context) => {

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
        const customerId = event.pathParameters.customerId

        const customer = await Customer.findOne({
            where: {
                id: customerId,
                brokerageId: user.brokerageId
            },
        })

        if (customer === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        const status = event.queryStringParameters.status
        // WILL NO LONGER NEED statusOperator
        const statusOperator = await getStatusQueryOperator(status)

        const laneWhereOptions = getLaneWhereOptionsByStatus(status)

        const originLanes = await Lane.findAll({
            where: laneWhereOptions,
            include: [{
                model: Location,
                as: 'origin',
                required: true,
                include: {
                    model: CustomerLocation,
                    required: true,
                    where: {
                        customerId: customerId
                    },
                    include: {
                        model: Customer,
                        required: true
                    }
                }
            },
            {
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

        const originLaneIds = originLanes.map(oL => oL.id)

        const destinationLanes = await Lane.findAll({
            where: {
                [Op.and]: [{
                    id: {
                        [Op.not]: originLaneIds
                    }
                }, {
                    // No longer going to be using owned
                    owned: {
                        [Op.not]: statusOperator
                    }
                }]
            },
            include: [{
                model: Location,
                as: 'destination',
                required: true,
                include: {
                    model: CustomerLocation,
                    required: true,
                    where: {
                        customerId: customerId
                    },
                    include: {
                        model: Customer,
                        required: true
                    }
                }
            },
            {
                model: Location,
                as: 'origin',
                include: [{
                    model: CustomerLocation,
                    include: {
                        model: Customer,
                        required: true
                    }
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
                Lanes: lanes
            }

            return {
                body: JSON.stringify(body),
                headers: corsHeaders,
                statusCode: 200
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
                const ownedLanePotential = await getHiddenPotentialForCustomer(customer)

                const sortedLanes = await lanes.sort((a, b) => b.opportunitySpend - a.opportunitySpend)
                const totalSpend = await lanes.reduce((a, b) => ({ opportunitySpend: a.opportunitySpend + b.opportunitySpend }))

                const loadsPerMonth = await lanes.reduce((a, b) => ({ opportunityVolume: a.opportunityVolume + b.opportunityVolume }))
                const totalOpportunitySpend = totalSpend.opportunitySpend + ownedLanePotential

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
    }
    catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.getLocationsForCustomer = async (event, context) => {
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

        const customerId = event.pathParameters.customerId

        const customer = await Customer.findOne({
            where: {
                id: customerId,
                brokerageId: user.brokerageId
            }
        })

        if (customer === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        const status = event.queryStringParameters.status
        const statusOperator = await getStatusQueryOperator(status)

        const customerLocations = await CustomerLocation.findAll({
            where: {
                customerId: customerId,
            },
            include: {
                model: Location,
                required: true,
                where: {
                    [Op.not]: {
                        owned: statusOperator
                    }
                }
            }
        })

        const locationsWithStats = await Promise.all(await customerLocations.map(async cL => {
            const lanesAsOrigin = await Lane.findAll({
                where: {
                    originLocationId: cL.Location.id,
                    [Op.not]: {
                        owned: statusOperator
                    }
                }
            })

            const lanesAsDestination = await Lane.findAll({
                where: {
                    destinationLocationId: cL.Location.id,
                    [Op.not]: {
                        owned: statusOperator
                    }
                },
                include: [{
                    model: Location,
                    as: 'origin',
                    required: true,
                    include: [{
                        model: LanePartner,
                        required: true
                    }]
                }]
            })

            const lanes = lanesAsOrigin.concat(lanesAsDestination)

            if (lanes.length == 0) {
                cL.dataValues.spend = 0
                cL.dataValues.loadsPerMonth = 0

                return cL
            }
            else {
                switch (status) {
                    case 'owned': {
                        const loadsPerMonth = await lanes.reduce((a, b) => ({ currentVolume: a.currentVolume + b.currentVolume }))
                        const spend = await lanes.reduce((a, b) => ({ spend: a.spend + b.spend }))

                        cL.dataValues.loadsPerMonth = loadsPerMonth.currentVolume
                        cL.dataValues.spend = spend.spend

                        return cL
                        
                    } case 'opportunities': {
                        const loadsPerMonth = await lanes.reduce((a, b) => ({ opportunityVolume: a.opportunityVolume + b.opportunityVolume }))
                        const opportunitySpend = await lanes.reduce((a, b) => ({ opportunitySpend: a.opportunitySpend + b.opportunitySpend }))

                        cL.dataValues.loadsPerMonth = loadsPerMonth.opportunityVolume
                        cL.dataValues.spend = opportunitySpend.opportunitySpend

                        return cL

                    } case 'potential': {
                        const loadsPerMonth = await lanes.reduce((a, b) => ({ potentialVolume: a.potentialVolume + b.potentialVolume }))
                        const potentialSpend = await lanes.reduce((a, b) => ({ potentialSpend: a.potentialSpend + b.potentialSpend }))

                        cL.dataValues.loadsPerMonth = loadsPerMonth.potentialVolume
                        cL.dataValues.spend = potentialSpend.potentialSpend

                        return cL
                    }
                }
            }
        }))

        const sortedLocations = locationsWithStats.sort((a, b) => {
            return b.dataValues.spend - a.dataValues.spend
        })

        return {
            body: JSON.stringify(sortedLocations),
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

module.exports.getTeammatesForCustomer = async (event, context) => {

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

        const customerId = event.pathParameters.customerId

        const customer = await Customer.findOne({
            where: {
                id: customerId,
                brokerageId: user.brokerageId
            },
            include: {
                model: User,
                include: {
                    model: Team
                }
            }
        })


        if (customer === null) {
            return {
                headers: corsHeaders,
                statusCode: 404
            }
        }

        return {
            body: JSON.stringify(customer.Users),
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

module.exports.addTeammateToCustomer = async (event, context) => {

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

        const customerId = request.customerId
        const userId = request.userId

        const customer = await Customer.findOne({
            where: {
                id: customerId,
                brokerageId: user.brokerageId
            }
        })

        const targetUser = await User.findOne({
            where: {
                id: userId,
                brokerageId: user.brokerageId
            }
        })

        if (targetUser === null || customer === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        const locations = await customer.getCustomerLocations({
            include: Location
        })

        let lanes = []
        for (const location of locations) {
            const locationLanes = await Lane.findAll({
                where: {
                    [Op.or]: [
                        { originLocationId: location.Location.id },
                        { destinationLocationId: location.Location.id }
                    ]
                },
                order: [
                    ['currentVolume', 'DESC'],
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

            for (const lane of locationLanes) {
                lanes.push(lane)
            }
        }

        for (const lane of lanes) {

            await TaggedLane.findOrCreate({
                where: {
                    laneId: lane.id,
                    userId: userId
                }
            })
        }

        for (const cL of locations) {

            await TaggedLocation.findOrCreate({
                where: {
                    locationId: cL.Location.id,
                    userId: userId
                }
            })
        }
        await TaggedCustomer.findOrCreate({
            where: {
                customerId: customerId,
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
module.exports.deleteTeammateFromCustomer = async (event, context) => {

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

        const targetUserId = request.userId

        const targetUser = await User.findOne({
            where: {
                id: targetUserId,
                brokerageId: user.brokerageId
            }
        })

        const customer = await Customer.findOne({
            where: {
                id: request.customerId,
                brokerageId: user.brokerageId
            }
        })

        if (targetUser === null || customer === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        await TaggedCustomer.destroy({
            where: {
                userId: targetUser.id,
                customerId: customer.id
            }
        })

        const locations = await customer.getCustomerLocations({
            include: Location
        })

        let lanes = []
        for (const location of locations) {
            const locationLanes = await Lane.findAll({
                where: {
                    [Op.or]: [
                        { originLocationId: location.Location.id },
                        { destinationLocationId: location.Location.id }
                    ]
                },
                order: [
                    ['currentVolume', 'DESC'],
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

            for (const lane of locationLanes) {
                lanes.push(lane)
            }
        }

        for (const lane of lanes) {

            await TaggedLane.destroy({
                where: {
                    laneId: lane.id,
                    userId: targetUserId
                }
            })
        }

        for (const cL of locations) {

            await TaggedLocation.destroy({
                where: {
                    locationId: cL.Location.id,
                    userId: targetUserId
                }
            })
        }

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

