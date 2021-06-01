const { Customer, CustomerLocation, Lane, LanePartner, Location } = require('.././models');
const { Op } = require("sequelize");

module.exports.getPotentialForOwnedLanes = async(customer) => {
    const customerId = customer.id

    const originLanes = await Lane.findAll({
        where: {
            owned: true
        },
        include: [{
            model: Location,
            as: 'origin',
            required: true,
            include: {
                model: CustomerLocation,
                required: true,
                where: {
                    customerId: customerId
                },
                include: {
                    model: Customer,
                    required: true
                }
            }
        },
        {
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

    const originLaneIds = originLanes.map(oL => oL.id)

    const destinationLanes = await Lane.findAll({
        where: {
            [Op.and]: [{
                id: {
                    [Op.not]: originLaneIds
                }
            }, {
                owned: true
            }]
        },
        include: [{
            model: Location,
            as: 'destination',
            required: true,
            include: {
                model: CustomerLocation,
                required: true,
                where: {
                    customerId: customerId
                },
                include: {
                    model: Customer,
                    required: true
                }
            }
        },
        {
            model: Location,
            as: 'origin',
            include: [{
                model: CustomerLocation,
                include: {
                    model: Customer,
                    required: true
                }
            },
            {
                model: LanePartner
            }],
        }]
    })

    const lanes = originLanes.concat(destinationLanes)

    for (const lane of lanes) {
        console.log(lane.id, lane.opportunitySpend)
    }

    const totalSpend = await lanes.reduce((a, b) => ({ opportunitySpend: a.opportunitySpend + b.opportunitySpend }))

    return totalSpend.opportunitySpend
}