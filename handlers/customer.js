'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, CustomerContact, CustomerLocation, Team, TaggedCustomer, LanePartner, Location, Lane, User } = require('.././models')

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

        const results = await Customer.findOne({
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

        if (results != null) {
            return {
                statusCode: 200,
                body: JSON.stringify(results)
            }
        } else {
            return {
                statusCode: 404
            }
        }

    } catch (err) {
        return {
            statusCode: 500
        }
    }
}
module.exports.getTopCustomers = async (event, context) => {

    const currentUser = await getCurrentUser(event.headers.Authorization)
    const userId = event.pathParameters.userId

    if (currentUser.id == null) {
        return {
            statusCode: 401
        }
    }

    try {
        const targetUser = await User.findOne({
            where: {
                id: userId,
            }
        })

        if (targetUser == null) {
            return {
                statusCode: 404
            }
        }

        if (targetUser.brokerageId != currentUser.brokerageId) {
            return {
                statusCode: 401
            }
        }

        const customers = await targetUser.getCustomers({
            include: [{
                model: CustomerLocation,
                required: true,
            //     include: [{
            //         model: Location,
            //         required: true,
            //         include: [{
            //             model: Lane,
            //             // required: true
            //         }]
            //     }]
            }]
        })

        let customerSpend = []

        for (const customer of customers) {

            const locations = await customer.getCustomerLocations()

            const spendForLocation = await locations.map(async cLocation => {

                    const location = await cLocation.getLocation()

                    const lanes = await location.getLanes()

                    const spendForLane = lanes.map( lane => {
                        
                        const spend = lane.frequency * lane.rate

                        return spend
                    })

                    return spendForLane
            })

            const final = await Promise.all(spendForLocation)

            // console.log(final)

            const sumPerLocation = final.map( item => item.reduce((a, b) => a+ b, 0))

            const sum = sumPerLocation.reduce((a, b) => a+ b, 0)

            // console.log(sum)
            
            customer.spend = sum

            customerSpend.push(sum)

        }

        // console.log(customerSpend)


        return {
            body: JSON.stringify(customersWithSpend),
            statusCode: 200
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

