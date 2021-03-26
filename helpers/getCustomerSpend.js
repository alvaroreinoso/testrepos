const { Customer, CustomerLocation, Lane, LanePartner, User, Location } = require('.././models');
const { Op } = require("sequelize");

module.exports.getCustomerSpend = async (customer) => {

    const locations = await customer.getCustomerLocations({
        include: [{
            model: Location,
        }]
    })

    let laneIds = new Set()

    for (const location of locations) {
        const locationLanes = await Lane.findAll({
            where: {
                [Op.or]: [
                    { originLocationId: location.Location.id },
                    { destinationLocationId: location.Location.id }
                ]
            },
            order: [
                ['frequency', 'DESC'],
            ],
        })

        for (const lane of locationLanes) {
            laneIds.add(lane.id)
        }
    }

    const lanes = await Promise.all([...laneIds].map(async laneId => {

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

        return lane
    }))

    const customerSpend = await lanes.reduce((a, b) => ({ spend: a.spend + b.spend }))

    const loadsPerWeek = await lands.reduce((a, b) => ({ frequency: a.frequency + b.frequency }))

    const loadsPerMonth = loadsPerWeek.frequency * 4

    return [customerSpend.spend, loadsPerMonth]
}