'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, CustomerLocation, Lane, LanePartner, Location, User, Team } = require('.././models');

module.exports.getLocationById = async (event, context) => {

    try {

        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == undefined) {
            return {
                statusCode: 401
            }
        }

        const locationId = event.pathParameters.id

        const results = await Location.findOne({
            where: {
                id: locationId
            },
            include: [{
                model: CustomerLocation,
                include: [{
                    model: Customer
                }]
                }, {
                model: LanePartner,
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
    }
    catch (err) {
        return {
            statusCode: 500
        }
    }

};