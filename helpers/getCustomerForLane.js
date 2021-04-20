const { Customer } = require('.././models');

module.exports = async (origin, destination) => {

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