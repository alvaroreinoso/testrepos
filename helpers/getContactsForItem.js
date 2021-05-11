const { Customer, Location, Lane } = require('.././models');

module.exports.getContactsForItem = async (itemType, itemId, brokerageId) => {
  switch (itemType) {
    case "customer":
        const customer = await Customer.findOne({
            where: {
                id: itemId,
                brokerageId
            }
        })

        if (customer === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        return await customer.getContacts()
    case "location":
        const location = await Location.findOne({
            where: {
                id: itemId,
                brokerageId
            }
        })

        if (location === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        return await location.getContacts()
    case "lane":
        const lane = await Lane.findOne({
            where: {
                id: itemId,
                brokerageId
            }
        })

        if (lane === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        return await lane.getContacts()
    default:
        console.log("Invalid itemType given")
  }
}
