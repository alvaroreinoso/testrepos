'use strict';
const getCurrentUser = require('.././helpers/user')
const { Customer, TaggedLane, TaggedLocation, CustomerContact, CustomerLocation, Team, TaggedCustomer, LanePartner, Location, Lane, User } = require('.././models')
const getFrequency = require('.././helpers/getLoadFrequency').getFrequency
const { Op } = require("sequelize");
const corsHeaders = require('.././helpers/cors')

module.exports.updateCustomer = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401,
            headers: corsHeaders
        }
    }

    try {
        const customerId = event.pathParameters.customerId
        const request = JSON.parse(event.body)

        const bio = request.bio

        const customer = await Customer.findOne({
            where: {
                id: customerId
            }
        })

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

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401,
            headers: corsHeaders
        }
    }

    try {
        const customerId = event.pathParameters.customerId

        const customer = await Customer.findOne({
            where: {
                id: customerId,
            }
        })

        if (customer != null) {
            return {
                statusCode: 200,
                body: JSON.stringify(customer),
                headers: corsHeaders
            }
        } else {
            return {
                statusCode: 404,
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

module.exports.getLanesForCustomer = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401,
            headers: corsHeaders
        }
    }

    try {
        const customerId = event.pathParameters.customerId

        const customer = await Customer.findOne({
            where: {
                id: customerId
            },
        })

        const locations = await customer.getCustomerLocations({
            include: [{
                model: Location,
            }]
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

        if (lanes.length == 0) {
            return {
                headers: corsHeaders,
                statusCode: 200
            }
        }


        const totalSpend = await lanes.reduce((a, b) => ({ spend: a.spend + b.spend }))

        const loadCounts = await lanes.map(async lane => {

            const frequency = await getFrequency(lane)

            if (frequency == 0) {
                return 0
            }

            return frequency
        })

        const loadsResolved = await Promise.all(loadCounts)
        const totalLoads = loadsResolved.reduce((a, b) => { return a + b })

        customer.dataValues.loadsPerMonth = totalLoads
        customer.dataValues.spendPerMonth = totalSpend.spend

        const body = {
            loadsPerWeek: totalLoads,
            spend: totalSpend.spend,
            Lanes: lanes
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

        const customerLocations = await CustomerLocation.findAll({
            where: {
                customerId: customerId
            },
            include: [{
                model: Location
            }]
        })

        return {
            body: JSON.stringify(customerLocations),
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
                id: customerId
            },
        })

        const users = await customer.getUsers()

        return {
            body: JSON.stringify(users),
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
                id: customerId
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

        await TaggedCustomer.destroy({
            where: {
                userId: targetUserId,
                customerId: request.customerId
            }
        })

        const customer = await Customer.findOne({
            where: {
                id: request.customerId
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

