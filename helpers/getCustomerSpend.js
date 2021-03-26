const { Customer, CustomerLocation, Lane, LanePartner, User, Location } = require('.././models');

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

    return customerSpend.spend
}