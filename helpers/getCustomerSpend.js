const { Customer, CustomerLocation, Lane, LanePartner, Location } = require('.././models');
const { Op } = require("sequelize");
const { getLaneWhereOptionsByStatus } = require('../helpers/getLaneWhereOptionsByStatus')

module.exports.getCustomerSpendAndLoadCount = async (customer, status) => {
    const laneWhereOptions = getLaneWhereOptionsByStatus(status)

    const lanes = await Lane.findAll({
        where: {
            laneWhereOptions
        },
        include: {
            [Op.or]: [{
                model: Location,
                as: 'origin',
                required: true,
                include: {
                    model: CustomerLocation,
                    required: true,
                    where: {
                        customerId: customer.id
                    },
                }
            }, {
                model: Location,
                as: 'destination',
                required: true,
                include: {
                    model: CustomerLocation,
                    required: true,
                    where: {
                        customerId: customer.id
                    },
                }
            }]
        }
    })

    // const originLanes = await Lane.findAll({
    //     where: laneWhereOptions,
    //     include: [{
    //         model: Location,
    //         as: 'origin',
    //         required: true,
    //         include: {
    //             model: CustomerLocation,
    //             required: true,
    //             where: {
    //                 customerId: customer.id
    //             },
    //             include: {
    //                 model: Customer,
    //                 required: true
    //             }
    //         }
    //     },
    //     {
    //         model: Location,
    //         as: 'destination',
    //         include: [{
    //             model: CustomerLocation,
    //             include: [{
    //                 model: Customer,
    //                 required: true
    //             }]
    //         },
    //         {
    //             model: LanePartner
    //         }],
    //     }]
    // })

    // const originLaneIds = originLanes.map(oL => oL.id)

    // const destinationLanes = await Lane.findAll({
    //     where: {
    //         [Op.and]: [{
    //             id: {
    //                 [Op.not]: originLaneIds
    //             }
    //         },
    //             laneWhereOptions
    //         ]
    //     },
    //     include: [{
    //         model: Location,
    //         as: 'destination',
    //         required: true,
    //         include: {
    //             model: CustomerLocation,
    //             required: true,
    //             where: {
    //                 customerId: customer.id
    //             },
    //             include: {
    //                 model: Customer,
    //                 required: true
    //             }
    //         }
    //     },
    //     {
    //         model: Location,
    //         as: 'origin',
    //         include: [{
    //             model: CustomerLocation,
    //             include: {
    //                 model: Customer,
    //                 required: true
    //             }
    //         },
    //         {
    //             model: LanePartner
    //         }],
    //     }]
    // })

    // const lanes = originLanes.concat(destinationLanes)

    if (lanes.length == 0) {
        return [0, 0]

    } else {
        switch (status) {
            case 'owned': {
                const totalSpend = await lanes.reduce((a, b) => ({ spend: a.spend + b.spend }))
                const loadsPerMonth = await lanes.reduce((a, b) => ({ currentVolume: a.currentVolume + b.currentVolume }))

                return [totalSpend.spend, loadsPerMonth.currentVolume]

            } case 'opportunities': {
                const totalSpend = await lanes.reduce((a, b) => ({ opportunitySpend: a.opportunitySpend + b.opportunitySpend }))
                const loadsPerMonth = await lanes.reduce((a, b) => ({ opportunityVolume: a.opportunityVolume + b.opportunityVolume }))

                return [totalSpend.opportunitySpend, loadsPerMonth.opportunityVolume]

            } case 'potential': {
                const totalSpend = await lanes.reduce((a, b) => ({ potentialSpend: a.potentialSpend + b.potentialSpend }))
                const loadsPerMonth = await lanes.reduce((a, b) => ({ potentialVolume: a.potentialVolume + b.potentialVolume }))

                return [totalSpend.potentialSpend, loadsPerMonth.potentialVolume]
            }
        }
    }
}
