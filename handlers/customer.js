'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, CustomerContact, CustomerLocation } = require('.././models')

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
                userId: user.id
            }
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
module.exports.getLocationsByCustomer = async (event, context) => {

}
module.exports.getCustomerById = async (event, context) => {

}