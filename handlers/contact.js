'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Customer, CustomerContact, LocationContact, Contact, LaneContact, Location, Lane } = require('.././models')

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

                const laneContacts = await lane.getContacts()

                return {
                    body: JSON.stringify(laneContacts),
                    statusCode: 200
                }

                break;

            } case 'location': {

                const location = await Location.findOne({
                    where: {
                        id: id
                    }
                })

                const locationContacts = await location.getContacts()

                return {
                    body: JSON.stringify(locationContacts),
                    statusCode: 200
                }

                break;

            } case 'customer': {

                const customer = await Customer.findOne({
                    where: {
                        id: id
                    }
                })

                const customerContacts = await customer.getContacts()

                return {
                    body: JSON.stringify(customerContacts),
                    statusCode: 200
                }

                break;

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

        const contact = await Contact.create({
            firstName: request.firstName,
            lastName: request.lastName,
            phone: request.phone,
            email: request.email,
            level: request.contactLevel
        })

        switch (type) {

            case 'lane': {

                LaneContact.create({
                    laneId: id,
                    contactId: contact.id
                })

                return {
                    statusCode: 204
                }

                break;

            } case 'location': {

                LocationContact.create({
                    locationId: id,
                    contactId: contact.id
                })

                return {
                    statusCode: 204
                }

                break;

            } case 'customer': {

                CustomerContact.create({
                    customerId: id,
                    contactId: contact.id
                })

                return {
                    statusCode: 204
                }
                break;

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
module.exports.editContact = async (event, context) => {

    try {

        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401
            }
        }

        const request = JSON.parse(event.body)

        const id = event.pathParameters.contactId

        const contact = await Contact.findOne({
            where: {
                id: id
            }
        })

        contact.firstName = request.firstName,
            contact.lastName = request.lastName,
            contact.phone = request.phone,
            contact.email = request.email,
            contact.level = request.contactLevel

        await contact.save()

        return {
            statusCode: 204
        }

    } catch (err) {

        return {
            statusCode: 500
        }
    }

}