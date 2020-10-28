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

module.exports.newCustomer = async (json) => {

    const existingCustomer = await Customer.findOne({
        where: {
            name: json.Customer
        }
    })

    if (existingCustomer == null) {

        return true
    
    } else {

        return false
    }

}

module.exports.newLane = async (json) => {

    const jsonOrigin = `${json['First Pick City']} ${json['First Pick State']}`
    const jsonDestination = `${json['Last Drop City']} ${json['Last Drop State']}`

    const existingLane = await Lane.findOne({
        where: {
            origin: jsonOrigin,
            destination: jsonDestination
        }
    })

    if (existingLane == null) {
        return true
    } else {

        return false
    }

}

module.exports.createLane = async (json) => {

    const jsonOrigin = `${json['First Pick City']} ${json['First Pick State']}`
    const jsonDestination = `${json['Last Drop City']} ${json['Last Drop State']}`

    const newLane = await Lane.create({
        origin: jsonOrigin,
        destination: jsonDestination
    })
    
    return newLane

}

module.exports.currentCustomer = async (json) => {

    const existingCustomer = await Customer.findOne({
        where: {
            name: json.Customer
        }
    })

    return existingCustomer
}
