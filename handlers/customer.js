'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, TaggedLane, TaggedLocation, CustomerContact, CustomerLocation, Team, TaggedCustomer, LanePartner, Location, Lane, User } = require('.././models')
const getFrequency = require('.././helpers/getLoadFrequency').getFrequency
const { Op } = require("sequelize");

module.exports.updateCustomer = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401
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
            statusCode: 204
        }

    } catch (err) {

        return {
            statusCode: 500
        }
    }
}

module.exports.getCustomer = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401
        }
    }

    try {
        const customerId = event.pathParameters.customerId

        const customer = await Customer.findOne({
            where: {
                id: customerId,
            },
            include: [{
                model: Team,
                required: true,
                where: {
                    brokerageId: user.brokerageId
                }
            }]
        })

        if (customer != null) {
            return {
                statusCode: 200,
                body: JSON.stringify(customer)
            }
        } else {
            return {
                statusCode: 404
            }
        }

    } catch (err) {

        console.log(err)
        return {
            statusCode: 500
        }
    }
}

module.exports.getLanesForCustomer = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)
    if (user.id == null) {

        return {

            statusCode: 401
        }
    }

    try {
        const customerId = event.pathParameters.customerId
        const customer = await Customer.findOne({
            where: {
                id: customerId
            },
            include: [{
                model: Team,
                required: true,
                attributes: ['brokerageId'],
                where: {
                    brokerageId: user.brokerageId
                }
            }]
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

        const totalSpend = await lanes.reduce((a, b) => ({ spend: a.spend + b.spend }))

        const loadCounts = await lanes.map(async lane => {

            const loads = await lane.getLoads()

            const frequency = await getFrequency(lane)

            if (frequency == 0) {
                return 0
            }

            const loadsPerWeek = loads.length / frequency

            return loadsPerWeek
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

module.exports.getLocationsForCustomer = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401
            }
        }

        const customerId = event.pathParameters.customerId

        const customer = await Customer.findOne({
            where: {
                id: customerId
            },
        })

        const customerLocations = await customer.getCustomerLocations({
            include: Location
        })

        return {
            body: JSON.stringify(customerLocations),
            statusCode: 200
        }

    } catch (err) {

        return {
            statusCode: 500
        }
    }

}

module.exports.getTeammatesForCustomer = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401
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
            statusCode: 200
        }
    }
    catch (err) {

        return {
            statusCode: 500
        }
    }
}

module.exports.addTeammateToCustomer = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401
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

        const lanes = await Lane.findAll({
            order: [
                ['frequency', 'DESC'],
            ],
            include: [{
                model: Location,
                as: 'origin',
                required: true,
                include: [{
                    model: CustomerLocation,
                    required: true,
                    include: [{
                        model: Customer,
                        required: true,
                        where: {
                            id: customer.id
                        }
                    }]
                },
                {
                    model: LanePartner
                }]
            }, {
                model: Location,
                required: true,
                as: 'destination',
                include: [{
                    model: CustomerLocation,
                    include: [{
                        model: Customer,
                        required: true,
                        where: {
                            id: customer.id
                        }
                    }]
                },
                {
                    model: LanePartner
                }]
            }]
        });

        for (const lane of lanes) {

            await TaggedLane.findOrCreate({
                where: {
                    laneId: lane.id,
                    userId: userId
                }
            })
        }

        const customerLocations = await customer.getCustomerLocations({
            include: Location
        })

        for (const cL of customerLocations) {

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
module.exports.deleteTeammateFromCustomer = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401
            }
        }

        const request = JSON.parse(event.body)

        await TaggedCustomer.destroy({
            where: {
                userId: request.userId,
                customerId: request.customerId
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

