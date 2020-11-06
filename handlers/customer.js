'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, CustomerContact, CustomerLocation, CustomerLane, Team, LanePartner, User } = require('.././models')

module.exports.getCustomersByCurrentUser = async (event, context) => {

    try {

        const user = await getCurrentUser(event.headers.Authorization)

        const customers = await Customer.findAll({
            where: {
                userId: user.id
            },
            include: [{
                model: CustomerLocation,
                limit: 1,
                include: [{
                    model: CustomerContact
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
            statusCode: 401
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

    try {

        const user = await getCurrentUser(event.headers.Authorization)

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
            statusCode: 401
        }
    }
}

module.exports.getCustomer = async (event, context) => {

    try {

        const user = await getCurrentUser(event.headers.Authorization)

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
            statusCode: 401
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
                include: [{
                    model: CustomerLane,
                    required: true
                }]
            }]
        })

        return {
            body: JSON.stringify(customers.sort()),
            statusCode: 200
        }

    } catch (error) {

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

    const allLanes = await CustomerLane.findAll({
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
        }, {
            model: LanePartner,
            required: true
        }]
    });

    return {
        body: JSON.stringify(allLanes),
        statusCode: 200
    }
}

module.exports.getCustomersLanesForUser = async (event, context) => {

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
        include: [{
            model: Team,
            required: true,
            attributes: ['brokerageId'],
            where: {
                brokerageId: user.brokerageId
            }
        }]
    })

    const userLanes = await CustomerLane.findAll({
        include: [{
            model: CustomerLocation,
            required: true,
            include: [{
                model: Customer,
                required: true,
                where: {
                    id: 1
                }
            }]
        },
        {
            model: User,
            required: true,
            attributes: ['id'],
            where: {
                id: user.id
            }
        }, {
            model: LanePartner,
            required: true
        }]
    });

    return {
        body: JSON.stringify(userLanes),
        statusCode: 200
    }
}

