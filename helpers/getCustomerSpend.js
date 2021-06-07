const { Customer, CustomerLocation, Lane, LanePartner, Location } = require('.././models');
const { Op } = require("sequelize");

module.exports.getCustomerSpendAndLoadCount = async (customer) => {
    const originLanes = await Lane.findAll({
        include: [{
            model: Location,
            as: 'origin',
            required: true,
            include: {
                model: CustomerLocation,
                required: true,
                where: {
                    customerId: customer.id
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
            id: {
                [Op.not]: originLaneIds
            }
        },
        include: [{
            model: Location,
            as: 'destination',
            required: true,
            include: {
                model: CustomerLocation,
                required: true,
                where: {
                    customerId: customer.id
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

    if (lanes.length == 0) {
        return [0, 0]

    } else {
        const customerSpend = await lanes.reduce((a, b) => ({ spend: a.spend + b.spend }))

        const loadsPerMonth = await lanes.reduce((a, b) => ({
            currentVolume: a.currentVolume + b.currentVolume 
            
        }))

        return [customerSpend.spend, loadsPerMonth.currentVolume]
    }
}
