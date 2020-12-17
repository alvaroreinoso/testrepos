'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, CustomerLocation, Team, LanePartner, Location, Lane } = require('.././models')
const { Op } = require("sequelize");

module.exports.getLanesForTeam = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401
        }
    }

    try {
        const teamId = event.pathParameters.teamId

        const team = await Team.findOne({
            where: {
                id: teamId,
                brokerageId: user.brokerageId
            }
        })

        const customers = await team.getCustomers()

        const customerLocations = await customers.map(async customer => {
            const cLs = await customer.getCustomerLocations({
                include: [{
                    model: Location,
                    required: true
                }]
            })

            return cLs
        })

        const clResolved = await Promise.all(customerLocations)

        let locations = []
        for (const arr of clResolved) {
            for (const loc of arr) {
                locations.push(loc.Location)
            }
        }

        let lanes = []
        for (const loc of locations) {
            const lanesForLocation = await loc.getLanes({
                include: [{
                    model: Location,
                    as: 'origin',
                    include: [{
                        model: CustomerLocation
                    },{
                        model: LanePartner
                    }]
                },
                {
                    model: Location,
                    as: 'destination',
                    include: [{
                        model: CustomerLocation
                    },{
                        model: LanePartner
                    }]
                }]
            })

            for (const lane of lanesForLocation) {
                lanes.push(lane)
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify(lanes)
        }

    } catch (err) {
        return {
            statusCode: 500
        }
    }
}