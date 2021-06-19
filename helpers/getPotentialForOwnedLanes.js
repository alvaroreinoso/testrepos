const { Customer, CustomerLocation, Lane, LanePartner, Location } = require('.././models');
const { Op } = require("sequelize");
// To Jerry - I think this can all be deleted; as it's no longer in use.
// It is screwing up the numbers for spend on Opportunities. Want your input before 
// deleting - Sam (from Sam (July 19, 2021)

module.exports.getHiddenPotentialForCustomer = async(customer) => {
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

    if (lanes.length == 0) {
        return 0
    }

    const totalSpend = await lanes.reduce((a, b) => ({ opportunitySpend: a.opportunitySpend + b.opportunitySpend }))

    return totalSpend.opportunitySpend
}
module.exports.getHiddenPotentialForLocation = async(location) => {
    
    const originLanes = await Lane.findAll({
        where: {
            owned: true,
            originLocationId: location.id
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

    const originLaneIds = originLanes.map(oL => oL.id)

    const destinationLanes = await Lane.findAll({
        where: {
            owned: true,
            [Op.not]: {
                id: originLaneIds
            },
            destinationLocationId: location.id
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

    const lanes = originLanes.concat(destinationLanes)

    if (lanes.length == 0) {
        return 0
        
    }

    const totalSpend = await lanes.reduce((a, b) => ({ opportunitySpend: a.opportunitySpend + b.opportunitySpend }))

    return totalSpend.opportunitySpend
}

module.exports.getHiddenPotentialForUser = async (user) => {

    const lanes = await user.getLanes({
        where: {
            owned: true
        }
    })

    if (lanes.length == 0) {
        return 0   
    }

    const totalSpend = await lanes.reduce((a, b) => ({ opportunitySpend: a.opportunitySpend + b.opportunitySpend }))

    return totalSpend.opportunitySpend
}