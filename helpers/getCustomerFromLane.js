const { Customer, CustomerLocation, Lane, LanePartner, User, Location } = require('.././models');


module.exports = async (lane, origin, destination) => {
    const originCustomerLocation = await origin.getCustomerLocation({
        include: {
            model: Customer,
            required: true
        }
    })

    const destinationCustomerLocation = await destination.getCustomerLocation({
        include: {
            model: Customer,
            required: true
        }
    })

    if (originCustomerLocation === null) {
        return destinationCustomerLocation.Customer.name
    } else {
        return originCustomerLocation.Customer.name
    }
}