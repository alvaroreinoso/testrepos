const { getLaneWhereOptionsByStatus } = require('./getLaneWhereOptionsByStatus');
const { Op } = require('sequelize')

class UserHelpers {
    constructor(db) {
        this.db = db
    }

    async getCustomerSpendAndLoadCount(customer, status) {
        const laneWhereOptions = getLaneWhereOptionsByStatus(status)

        const originLanes = await this.db.Lane.findAll({
            where: laneWhereOptions,
            include: [{
                model: this.db.Location,
                as: 'origin',
                required: true,
                include: {
                    model: this.db.CustomerLocation,
                    required: true,
                    where: {
                        customerId: customer.id
                    },
                    include: {
                        model: this.db.Customer,
                        required: true
                    }
                }
            },
            {
                model: this.db.Location,
                as: 'destination',
                include: [{
                    model: this.db.CustomerLocation,
                    include: [{
                        model: this.db.Customer,
                        required: true
                    }]
                },
                {
                    model: this.db.LanePartner
                }],
            }]
        })

        const originLaneIds = originLanes.map(oL => oL.id)

        const destinationLanes = await this.db.Lane.findAll({
            where: {
                [Op.and]: [{
                    id: {
                        [Op.not]: originLaneIds
                    }
                },
                    laneWhereOptions
                ]
            },
            include: [{
                model: this.db.Location,
                as: 'destination',
                required: true,
                include: {
                    model: this.db.CustomerLocation,
                    required: true,
                    where: {
                        customerId: customer.id
                    },
                    include: {
                        model: this.db.Customer,
                        required: true
                    }
                }
            },
            {
                model: this.db.Location,
                as: 'origin',
                include: [{
                    model: this.db.CustomerLocation,
                    include: {
                        model: this.db.Customer,
                        required: true
                    }
                },
                {
                    model: this.db.LanePartner
                }],
            }]
        })

        const lanes = originLanes.concat(destinationLanes)

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
}

module.exports = UserHelpers;