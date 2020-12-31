'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const jwt = require('jsonwebtoken')
const { Team, Brokerage, User, Ledger, Location, Customer } = require('.././models');
const { getCustomerSpend } = require('.././helpers/getCustomerSpend')

module.exports.joinTeam = async (event, context) => {


    const user = await getCurrentUser(event.headers.Authorization)

    const teamId = event.pathParameters.teamId

    user.teamId = teamId

    await user.save()

    return {
        statusCode:204
    }

}

module.exports.getTeamsForBrokerage = async (event, context) => {

    const currentUser = await getCurrentUser(event.headers.Authorization)

    const teams = await Team.findAll({
        where: {
            brokerageId: currentUser.brokerageId
        },
        include: [{
            model: User
        }]
    })

    for (const team of teams) {

        team.dataValues.teammates = team.Users.length
    }

    return {
        body: JSON.stringify(teams),
        statusCode: 200
    }
}

module.exports.getCustomersForBrokerage = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    const customers = await Customer.findAll({
        where: {
            brokerageId: user.brokerageId
        }
    })

    return {
        body: JSON.stringify(customers),
        statusCode: 200
    }

}

module.exports.selectCustomers = async (event, context) => {

    const request = JSON.parse(event.body)

    for (const customer of request.customers) {

        console.log(customer)
    }

        // const customerId = request.customerId
        // const userId = request.userId

        // const customer = await Customer.findOne({
        //     where: {
        //         id: customerId
        //     }
        // })

        // const locations = await customer.getCustomerLocations({
        //     include: Location
        // })

        // let lanes = []
        // for (const location of locations) {
        //     const locationLanes = await Lane.findAll({
        //         where: {
        //             [Op.or]: [
        //                 { originLocationId: location.Location.id },
        //                 { destinationLocationId: location.Location.id }
        //             ]
        //         },
        //         order: [
        //             ['frequency', 'DESC'],
        //         ],
        //         include: [{
        //             model: Location,
        //             as: 'origin',
        //             include: [{
        //                 model: CustomerLocation,
        //                 include: [{
        //                     model: Customer,
        //                     required: true
        //                 }]
        //             },
        //             {
        //                 model: LanePartner
        //             }],
        //         }, {
        //             model: Location,
        //             as: 'destination',
        //             include: [{
        //                 model: CustomerLocation,
        //                 include: [{
        //                     model: Customer,
        //                     required: true
        //                 }]
        //             },
        //             {
        //                 model: LanePartner
        //             }],
        //         }]
        //     })

        //     for (const lane of locationLanes) {
        //         lanes.push(lane)
        //     }
        // }

        // for (const lane of lanes) {

        //     await TaggedLane.findOrCreate({
        //         where: {
        //             laneId: lane.id,
        //             userId: userId
        //         }
        //     })
        // }

        // for (const cL of locations) {

        //     await TaggedLocation.findOrCreate({
        //         where: {
        //             locationId: cL.Location.id,
        //             userId: userId
        //         }
        //     })
        // }
        // await TaggedCustomer.findOrCreate({
        //     where: {
        //         customerId: customerId,
        //         userId: userId
        //     }
        // })

        return {
            statusCode: 204
        }

}