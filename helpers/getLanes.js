const { Customer, CustomerLocation, Lane, LanePartner, User, Location } = require('.././models');
const { Op } = require("sequelize");

module.exports.getLanesFromLocations = async (locations) => {

    let lanes = []

    for (const location of locations) {

        const locationId = location.id

        const locationLanes = await Lane.findAll({
            where: {
                [Op.or]: [
                    { originLocationId: locationId },
                    { destinationLocationId: locationId }
                ]
            },
        })

        locationLanes.forEach(lane => lanes.push(lane.id))
    }

    return lanes
}

module.exports.getLanesFromCustomers = async (customers) => {

    let lanes = []

    for (const customer of customers) {

        const cLanes = await Lane.findAll({
            order: [
                ['currentVolume', 'DESC'],
            ],
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

        cLanes.forEach(lane => lanes.push(lane.id))

    }

    return lanes
}

module.exports.getLanesFromIds = async (laneIds) => {

    let lanes = []

    for (const laneId of laneIds) {

        const lane = await Lane.findOne({
            where: {
                id: laneId
            },
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

        lanes.push(lane)
    }

    return lanes
}