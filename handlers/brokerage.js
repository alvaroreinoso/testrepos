'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, Brokerage, CustomerLocation, LanePartner, Team, User, Location, Lane, Ledger } = require('.././models')
const { Op } = require("sequelize");

module.exports.getBrokerage = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)
    const brokerageId = event.pathParameters.brokerageId

    if (user.id == null) {
        return {
            statusCode: 401
        }
    }

    const brokerage = await Brokerage.findOne({
        where: {
            id: brokerageId,
        },
    })

    const customers = await brokerage.getCustomers()
    const customerCount = customers.length

    const teammates = await brokerage.getUsers()
    const teams = await brokerage.getTeams()

    let teammatesWithCount = []

    for (const team of teams) {

        let revenuePerUser = []
        let lanesForUser = new Set()

        const users = await team.getUsers()

        team.dataValues.teammateCount = users.length

        for (const mate of users) {

            const customers = await mate.getCustomers()

            mate.dataValues.customerCount = customers.length

            const lanes = await mate.getLanes()

            for (const lane of lanes) {

                lanesForUser.add(lane.id)
            }

            if (lanes.length != 0) {

                const laneSpend = await lanes.map(lane => lane.spend)
                const revenue = await laneSpend.reduce((a, b) => (a + b))
                mate.dataValues.revenue = revenue
                revenuePerUser.push(revenue)
            }
            else {
                mate.dataValues.revenue = 0
            }

            teammatesWithCount.push(mate)
        }


        const lanesForTeam = [...lanesForUser].map(async laneId => {

            const lane = await Lane.findOne({
                where: {
                    id: laneId
                },
            })

            return lane
        })

        const lanesResolved = await Promise.all(lanesForTeam)
        const laneSpend = lanesResolved.map(lane => lane.spend)

        if (laneSpend.length == 0) {

            team.dataValues.revenue = 0
        } else {
            const teamSpend = await laneSpend.reduce((a, b) => a + b)

            team.dataValues.revenue = teamSpend
        }
    }

    const topTeams = teams.sort((a, b) => { return b.dataValues.revenue - a.dataValues.revenue })
    const topTeammates = teammatesWithCount.sort((a, b) => { return b.dataValues.revenue - a.dataValues.revenue })
    const teammateCount = teammates.length

    brokerage.dataValues.customers = customerCount
    brokerage.dataValues.teammates = teammateCount
    brokerage.dataValues.topTeammates = topTeammates
    brokerage.dataValues.topTeams = topTeams

    return {
        body: JSON.stringify(brokerage),
        statusCode: 200
    }
}

module.exports.getLanesForBrokerage = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)
    const brokerageId = event.pathParameters.brokerageId

    if (user.id == null) {
        return {
            statusCode: 401
        }
    }

    if (user.brokerageId != brokerageId) {
        return {
            statusCode: 401
        }
    }

    try {

        const locations = await Location.findAll({
            include: [{
                model: CustomerLocation,
                required: true,
                include: [{
                    model: Customer,
                    required: true,
                    where: {
                        brokerageId: brokerageId
                    }
                }]
            }]
        })

        let lanes = []
        for (const location of locations) {
            const locationLanes = await Lane.findAll({
                where: {
                    [Op.or]: [
                        { originLocationId: location.id },
                        { destinationLocationId: location.id }
                    ]
                },
                order: [
                    ['frequency', 'DESC'],
                ],
                include: [{
                    model: Location,
                    as: 'origin',
                    include: [{
                        model: CustomerLocation,
                        include: [{
                            model: Customer,
                            required: true
                        }]
                    },
                    {
                        model: LanePartner
                    }],
                }, {
                    model: Location,
                    as: 'destination',
                    include: [{
                        model: CustomerLocation,
                        include: [{
                            model: Customer,
                            required: true
                        }]
                    },
                    {
                        model: LanePartner
                    }],
                }]
            })

            for (const lane of locationLanes) {
                lanes.push(lane)
            }
        }

        const laneSpend = lanes.map(lane => lane.spend)
        const brokerageSpend = await laneSpend.reduce((a, b) => a + b)

        const loadsPerWeek = await lanes.reduce((a, b) => ({ frequency: a.frequency + b.frequency }))

        const body = {
            revenue: brokerageSpend,
            loadsPerWeek: loadsPerWeek.frequency,
            Lanes: lanes
        }

        return {
            statusCode: 200,
            body: JSON.stringify(body)
        }
    } catch (err) {

        return {
            statusCode: 500
        }
    }
}

module.exports.editBrokerage = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.admin == false) {

            return {
                statusCode: 403
            }
        }

        const request = JSON.parse(event.body)

        const brokerage = await Brokerage.findOne({
            where: {
                id: request.id
            }
        })

        brokerage.name = request.name,
        brokerage.address = request.address,
        brokerage.address2 = request.address2,
        brokerage.city = request.city,
        brokerage.state = request.state,
        brokerage.zipcode = request.zipcode,
        brokerage.phone = request.phone

        await brokerage.save()

        return {
            statusCode: 204
        }
    } catch (err) {

        console.log(err)

        return {
            statusCode: 500
        }
    }

}