'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, CustomerLocation, Lane, LanePartner, Location, User, Team } = require('.././models');
const { Op } = require("sequelize");

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
            include: [
                {
                    model: CustomerLocation,
                    include: [{
                        model: Customer,
                        required: true
                    }]
                },
                {
                    model: LanePartner,
                }]
        })

        return {
            body: JSON.stringify(results),
            statusCode: 200
        }
    }
    catch (err) {
        console.log(err)
        return {
            statusCode: 500
        }
    }

};

module.exports.getLanesForLocation = async (event, context) => {


    try {

        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == undefined) {
            return {
                statusCode: 401
            }
        }

        const locationId = event.pathParameters.id

        const lanes = await Lane.findAll({
            where: {
                [Op.or]: [
                    { originLocationId: locationId },
                    { destinationLocationId: locationId }
                ]
            },
            include: [{
                model: Location,
                as: 'origin',
                include: [{
                    model: CustomerLocation,
                },
                {
                    model: LanePartner
                }],
            }, {
                model: Location,
                as: 'destination',
                include: [{
                    model: CustomerLocation,
                },
                {
                    model: LanePartner
                }],
            }]
        })

        return {
            body: JSON.stringify(lanes),
            statusCode: 200
        }

    } catch(err) {
        console.log(err)
        return {
            statusCode: 500
        }
    }

} 