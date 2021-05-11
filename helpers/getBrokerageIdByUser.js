const { Brokerage } = require('.././models');

module.exports.getBrokerageIdByUser = async (user) => {
    const brokerage = await Brokerage.findOne({
        where: {
            id: user.brokerageId
        }
    })

    return brokerage.id
}