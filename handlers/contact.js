'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, CustomerContact, Ledger, LocationContact, Contact, LaneContact, Location, Lane } = require('.././models')
const elastic = require('.././elastic/hooks')

module.exports.getContacts = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401
        }
    }

    try {

        const type = event.queryStringParameters.contactType
        const id = event.pathParameters.itemId

        switch (type) {

            case 'lane': {

                const lane = await Lane.findOne({
                    where: {
                        id: id
                    }
                })

                const laneContacts = await lane.getContacts({
                    order: [
                        ['level', 'ASC'],
                    ],
                })

                return {
                    body: JSON.stringify(laneContacts),
                    statusCode: 200
                }

            } case 'location': {

                const location = await Location.findOne({
                    where: {
                        id: id
                    }
                })

                const locationContacts = await location.getContacts({
                    order: [
                        ['level', 'ASC'],
                    ],
                })

                return {
                    body: JSON.stringify(locationContacts),
                    statusCode: 200
                }

            } case 'customer': {

                const customer = await Customer.findOne({
                    where: {
                        id: id
                    }
                })

                const customerContacts = await customer.getContacts({
                    order: [
                        ['level', 'ASC'],
                    ],
                })

                return {
                    body: JSON.stringify(customerContacts),
                    statusCode: 200
                }

            } default: {

                return {
                    statusCode: 500
                }
            }
        }

    } catch (err) {

        return {
            statusCode: 500
        }
    }
}

module.exports.addContact = async (event, context) => {

    try {

        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401
            }
        }

        const type = event.queryStringParameters.contactType
        const request = JSON.parse(event.body)
        const id = event.pathParameters.itemId
        const existing = event.queryStringParameters.existing

        if (existing == 'true') {

            const contact = await Contact.findOne({
                where: {
                    id: request.id
                }
            })

            switch (type) {

                case 'universal': {

                    // create customer contact

                    await CustomerContact.findOrCreate({
                        where: {
                            customerId: id,
                            contactId: contact.id
                        }
                    })

                    const customer = await Customer.findOne({
                        where: {
                            id: id
                        }
                    })

                    const customerLocations = await customer.getCustomerLocations({
                        include: [{
                            model: Location,
                            required: true
                        }]
                    })

                    for (const customerLocation of customerLocations) {

                        const location = customerLocation.Location

                        await LocationContact.findOrCreate({
                            where: {
                                locationId: location.id,
                                contactId: contact.id
                            }
                        })

                        const lanes = await location.getLanes()

                        for (const lane of lanes) {

                            await LaneContact.findOrCreate({
                                where: {
                                    laneId: lane.id,
                                    contactId: contact.id
                                }
                            })
                        }
                    }

                    break;
                }

                case 'lane': {

                    await LaneContact.findOrCreate({
                        where: {
                            laneId: id,
                            contactId: contact.id
                        }
                    })

                    break;

                } case 'location': {

                    await LocationContact.findOrCreate({
                        where: {
                            locationId: id,
                            contactId: contact.id
                        }
                    })

                    break;

                } case 'customer': {

                    await CustomerContact.findOrCreate({
                        where: {
                            customerId: id,
                            contactId: contact.id
                        }
                    })

                    break;

                } default: {

                    return {
                        statusCode: 500
                    }
                }
            }

            return {
                statusCode: 204
            }
        }

        else {

            const contact = await Contact.create({
                firstName: request.firstName,
                lastName: request.lastName,
                phoneExt: request.phoneExt,
                phone: request.phone,
                email: request.email,
                level: request.level,
                title: request.title
            })

            await elastic.saveContact(contact, user.brokerageId)

            switch (type) {

                case 'universal': {

                    // create customer contact

                    await CustomerContact.findOrCreate({
                        where: {
                            customerId: id,
                            contactId: contact.id
                        }
                    })

                    const customer = await Customer.findOne({
                        where: {
                            id: id
                        }
                    })

                    const customerLocations = await customer.getCustomerLocations({
                        include: [{
                            model: Location,
                            required: true
                        }]
                    })

                    for (const customerLocation of customerLocations) {

                        const location = customerLocation.Location

                        await LocationContact.findOrCreate({
                            where: {
                                locationId: location.id,
                                contactId: contact.id
                            }
                        })

                        const lanes = await location.getLanes()

                        for (const lane of lanes) {

                            await LaneContact.findOrCreate({
                                where: {
                                    laneId: lane.id,
                                    contactId: contact.id
                                }
                            })
                        }
                    }

                    break;
                }

                case 'lane': {

                    await LaneContact.create({
                        laneId: id,
                        contactId: contact.id
                    })

                    break

                } case 'location': {

                    await LocationContact.create({
                        locationId: id,
                        contactId: contact.id
                    })

                    break

                } case 'customer': {

                    await CustomerContact.create({
                        customerId: id,
                        contactId: contact.id
                    })

                    break

                } default: {

                    return {
                        statusCode: 500
                    }
                }

            }

            return {
                statusCode: 204
            }
        }
    } catch (err) {
        return {
            statusCode: 500
        }
    }
}

module.exports.editContact = async (event, context) => {

    try {

        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401
            }
        }

        const request = JSON.parse(event.body)
        const id = request.id

        const contact = await Contact.findOne({
            where: {
                id: id
            }
        })

        contact.firstName = request.firstName
        contact.lastName = request.lastName
        contact.phoneExt = request.phoneExt
        contact.phone = request.phone
        contact.email = request.email
        contact.level = request.level

        await contact.save()

        await elastic.editContact(contact)

        return {
            statusCode: 204
        }

    } catch (err) {

        return {
            statusCode: 500
        }
    }

}

module.exports.deleteContact = async (event, context) => {

    try {

        const request = JSON.parse(event.body)

        const type = event.queryStringParameters.contactType

        switch (type) {

            case 'lane': {

                const laneContact = await LaneContact.findOne({
                    where: {
                        laneId: request.LaneContact.laneId,
                        contactId: request.LaneContact.contactId
                    }
                })

                if (laneContact === null) {

                    return {
                        statusCode: 404
                    }
                }

                await laneContact.destroy()

                const contact = await Contact.findOne({
                    where: {
                        id: laneContact.contactId
                    },
                    include: { all: true }
                })


                if (contact.Locations.length == 0 && contact.Customers.length == 0 && contact.Lanes.length == 0) {

                    await contact.destroy()

                    return {
                        statusCode: 204
                    }
                }

                return {
                    body: JSON.stringify(contact),
                    statusCode: 200
                }

            } case 'location': {

                const locationContact = await LocationContact.findOne({
                    where: {
                        locationId: request.LocationContact.locationId,
                        contactId: request.LocationContact.contactId
                    }
                })

                if (locationContact === null) {

                    return {
                        statusCode: 404
                    }
                }

                await locationContact.destroy()

                const contact = await Contact.findOne({
                    where: {
                        id: locationContact.contactId
                    },
                    include: { all: true }
                })

                if (contact.Locations.length == 0 && contact.Customers.length == 0 && contact.Lanes.length == 0) {

                    await contact.destroy()

                    return {
                        body: 'contact destroyed',
                        statusCode: 200
                    }
                }

                return {
                    body: JSON.stringify(contact),
                    statusCode: 200
                }

            } case 'customer': {

                const customerContact = await CustomerContact.findOne({
                    where: {
                        customerId: request.CustomerContact.customerId,
                        contactId: request.CustomerContact.contactId
                    }
                })

                if (customerContact === null) {

                    return {
                        statusCode: 404
                    }
                }

                await customerContact.destroy()

                const contact = await Contact.findOne({
                    where: {
                        id: customerContact.contactId
                    },
                    include: { all: true }
                })

                if (contact.Locations.length == 0 && contact.Customers.length == 0 && contact.Lanes.length == 0) {

                    await contact.destroy()

                    return {
                        body: 'contact destroyed',
                        statusCode: 200
                    }
                }

                return {
                    body: JSON.stringify(contact),
                    statusCode: 200
                }

            } default: {

                return {
                    statusCode: 500
                }
            }
        }
    } catch (err) {

        return {
            statusCode: 500
        }
    }


}