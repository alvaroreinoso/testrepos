'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, CustomerLocation, Lane, LanePartner, Location, User, Team } = require('.././models');

module.exports.getCustomerLocation = async (event, context) => {

    try {

        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == undefined) {
            return {
                statusCode: 401
            }
        }

        const customerLocationId = event.pathParameters.id

        const results = await CustomerLocation.findOne({
            where: {
                id: customerLocationId
            },
            include: [{
                model: Location,
                include: [{
                    model: LanePartner,
                    required: true
                }]
            }, {
                model: Customer,
                required: true,
                include: [{
                    model: Team,
                    required: true,
                    attributes: ['brokerageId'],
                    where: {
                        brokerageId: user.brokerageId
                    }
                }]
            }]
        })

        console.log(results.toJSON())

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
    }
    catch (err) {

        console.log(err)

        return {
            statusCode: 500
        }
    }

};