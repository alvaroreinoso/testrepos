'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, CustomerLocation, Lane, LanePartnerLocation, LanePartner } = require('.././models')

module.exports.getCustomersByCurrentUser = async (event, context) => {

    try {

        const user = await getCurrentUser(event.headers.Authorization)

        const customers = await Customer.findAll({
            where: {
                userId: user.id
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