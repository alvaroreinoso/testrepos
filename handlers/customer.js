'use strict';
const getCurrentUser = require('.././helpers/user')
const { Customer, TaggedLane, TaggedLocation, CustomerContact, CustomerLocation, Team, TaggedCustomer, LanePartner, Location, Lane, User } = require('.././models')
const getFrequency = require('.././helpers/getLoadFrequency').getFrequency
const { Op } = require("sequelize");
const corsHeaders = require('.././helpers/cors')

module.exports.updateCustomer = async (event, context) => {

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

        const bio = request.bio

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

        customer.bio = bio

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

        const locations = await customer.getCustomerLocations({
            include: [{
                model: Location,
            }]
        })

        let laneIds = new Set()

        for (const location of locations) {
            const locationLanes = await Lane.findAll({
                where: {
                    [Op.or]: [
                        { originLocationId: location.Location.id },
                        { destinationLocationId: location.Location.id }
                    ]
                },
                order: [
                    ['frequency', 'DESC'],
                ],
            })

            for (const lane of locationLanes) {
                laneIds.add(lane.id)
            }
        }

        const lanes = await Promise.all([...laneIds].map(async laneId => {

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

        if (lanes.length == 0) {

            const body = {
                loadsPerWeek: 0,
                spend: 0,
                Lanes: lanes
            }

            return {
                body: JSON.stringify(body),
                headers: corsHeaders,
                statusCode: 200
            }
        }

        const sortedLanes = await lanes.sort((a, b) => b.spend - a.spend)

        const totalSpend = await lanes.reduce((a, b) => ({ spend: a.spend + b.spend }))

        const loadsPerWeek = await lanes.reduce((a, b) => ({ frequency: a.frequency + b.frequency }))
        const loadsPerMonth = loadsPerWeek.frequency * 4

        const body = {
            loadsPerMonth: loadsPerMonth,
            spend: totalSpend.spend,
            Lanes: sortedLanes
        }

        return {
            body: JSON.stringify(body),
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

module.exports.getLocationsForCustomer = async (event, context) => {

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

        const customerLocations = await CustomerLocation.findAll({
            where: {
                customerId: customerId
            },
            include: [{
                model: Location,
                // include: [{
                //     model: Lane,
                //     attributes: ['spend', 'frequency']
                // }]
            }]
        })

        const locationsWithStats = await Promise.all(await customerLocations.map(async cL => {

            const lanesAsOrigin = await Lane.findAll({
                where: {
                    originLocationId: cL.Location.id
                }
            })

            const lanesAsDestination = await Lane.findAll({
                where: {
                    destinationLocationId: cL.Location.id
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

            } else {

                const loadsPerWeek = await lanes.reduce((a, b) => ({ frequency: a.frequency + b.frequency}))
                const spend = await lanes.reduce((a, b) => ({ spend: a.spend + b.spend }))

                cL.dataValues.spend = spend.spend
                cL.dataValues.loadsPerMonth = loadsPerWeek.frequency * 4

                return cL
            }
        }))

        const sortedLocations = await locationsWithStats.sort((a, b) => b.spend - a.spend)

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
                through: { attributes: []},
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
                    ['frequency', 'DESC'],
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
                    ['frequency', 'DESC'],
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

