'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, TaggedLane, TaggedLocation, CustomerContact, CustomerLocation, Team, TaggedCustomer, LanePartner, Location, Lane, User } = require('.././models')
const dateFns = require('date-fns')

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

        const lanesWithSpend = await lanes.map(lane => {

            const frequency = await getFrequency(lane)

            const spend = frequency * lane.rate

            lane.dataValues.spend = spend

            return lane.dataValues
        })

        const lanesResolved = await Promise.all(lanesWithSpend)

        const totalSpend = await lanesResolved.reduce((a, b) => ({ spend: a.spend + b.spend }))
        
        const loadCounts = await lanes.map(async lane => {

            let d = new Date();

            d.setMonth(d.getMonth() - 1);

            const loads = await lane.getLoads({
                // where: {
                //     createdAt: {
                //         $between: [d, new Date()]
                //     }
                // }
            })

            return loads.length
        })

        const loadsResolved = await Promise.all(loadCounts)
        const totalLoads = loadsResolved.reduce((a, b) => {return a + b})

        customer.dataValues.totalLoads = totalLoads
        customer.dataValues.spend = totalSpend.spend

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

        return {
            body: JSON.stringify(lanes),
            statusCode: 200
        }
    }
    catch (err) {
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

