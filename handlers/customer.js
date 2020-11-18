'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, CustomerContact, CustomerLocation, Team, LanePartner, Location, Lane, User } = require('.././models')

module.exports.getCustomersByCurrentUser = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401
        }
    }

    try {
        const customers = await Customer.findAll({
            where: {
                userId: user.id
            },
            include: [{
                model: CustomerLocation,
                limit: 1,
                include: [{
                    model: Location,
                    include: [{
                        model: CustomerContact
                    }]
                }]
            }]
        });

        return {
            statusCode: 200,
            body: JSON.stringify(customers)
        }

    } catch (err) {
        console.log(err)
        return {
            statusCode: 500
        }
    }
}

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

module.exports.getCustomersByTeam = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401
        }
    }

    try {
        const customers = await Customer.findAll({
            where: {
                teamId: user.teamId
            }
        });

        return {
            statusCode: 200,
            body: JSON.stringify(customers)
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

    const user = await getCurrentUser(event.headers.Authorization)
    const userId = event.pathParameters.userId

    if (user.id == null) {
        return {
            statusCode: 401
        }
    }

    try {
        const targetUser = await User.findOne({
            where: {
                id: userId,
                brokerageId: user.brokerageId
            }
        })

        if (targetUser == null) {
            return {
                statusCode: 404
            }
        }

        const customers = await Customer.findAll({
            where: {
                userId: targetUser.id
            },
            include: [{
                model: CustomerLocation,
                required: true,
            }]
        })

        return {
            body: JSON.stringify(customers.sort()),
            statusCode: 200
        }

    } catch (err) {
        console.log(err)
        return {
            statusCode: 500
        }
    }

}

module.exports.getCustomersLanes = async (event, context) => {

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

