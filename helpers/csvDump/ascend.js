const { Team, Brokerage, User, Ledger, Load, Customer, CustomerLane, CustomerLocation, Lane, LanePartner } = require('../../models');

module.exports.newLoad = async (load) => {

    const existingLoad = await Load.findOne({
        where: {
            loadId: load['Load ID']
        }
    })

    if (existingLoad == null) {

        return true
    
    } else {

        return false
    }

}