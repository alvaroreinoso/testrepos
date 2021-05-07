'use strict';
const getCurrentUser = require('.././helpers/user')
const { Customer, CustomerContact, Ledger, LocationContact, Contact, LaneContact, Location, Lane } = require('.././models')
const corsHeaders = require('.././helpers/cors')

module.exports.getContacts = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {
        return {
            statusCode: 401,
            headers: corsHeaders
        }
    }

    try {
        const type = event.queryStringParameters.contactType
        const id = event.pathParameters.itemId

        switch (type) {

            case 'lane': {

                const lane = await Lane.findOne({
                    where: {
                        id: id,
                        brokerageId: user.brokerageId
                    }
                })

                if (lane === null) {
                    return {
                        statusCode: 404,
                        headers: corsHeaders
                    }
                }

                const laneContacts = await lane.getContacts({
                    order: [
                        ['level', 'ASC'],
                    ],
                })

                return {
                    body: JSON.stringify(laneContacts),
                    statusCode: 200,
                    headers: corsHeaders
                }

            } case 'location': {

                const location = await Location.findOne({
                    where: {
                        id: id,
                        brokerageId: user.brokerageId
                    }
                })

                if (location === null) {
                    return {
                        statusCode: 404,
                        headers: corsHeaders
                    }
                }

                const locationContacts = await location.getContacts({
                    order: [
                        ['level', 'ASC'],
                    ],
                })

                return {
                    body: JSON.stringify(locationContacts),
                    statusCode: 200,
                    headers: corsHeaders
                }

            } case 'customer': {

                const customer = await Customer.findOne({
                    where: {
                        id: id,
                        brokerageId: user.brokerageId
                    }
                })

                if (customer === null) {
                    return {
                        statusCode: 404,
                        headers: corsHeaders
                    }
                }

                const customerContacts = await customer.getContacts({
                    order: [
                        ['level', 'ASC'],
                    ],
                })

                return {
                    body: JSON.stringify(customerContacts),
                    statusCode: 200,
                    headers: corsHeaders
                }

            } default: {

                return {
                    statusCode: 500,
                    headers: corsHeaders
                }
            }
        }

    } catch (err) {

        console.log(err)

        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.addContact = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const user = await getCurrentUser(event.headers.Authorization)
        if (user.id == null) {
            return {
                statusCode: 401,
                headers: corsHeaders
            }
        }

        const type = event.queryStringParameters.contactType
        const universal = event.queryStringParameters.universal
        const request = JSON.parse(event.body)
        const id = event.pathParameters.itemId
        const existing = event.queryStringParameters.existing

        if (existing == 'true') {

            const contact = await Contact.findOne({
                where: {
                    id: request.id,
                    brokerageId: user.brokerageId
                }
            })

            if (universal == 'true') {

                switch (type) {
                    case 'customer': {

                        const customer = await Customer.findOne({
                            where: {
                                id: id,
                                brokerageId: user.brokerageId
                            }
                        })

                        if (customer === null) {
                            return {
                                statusCode: 404,
                                headers: corsHeaders
                            }
                        }

                        const customerContact = await CustomerContact.findOne({
                            where: {
                                customerId: customer.id,
                                contactId: contact.id
                            }
                        })

                        if (customerContact !== null) {
                            return {
                                statusCode: 409,
                                headers: corsHeaders
                            }
                        }

                        await CustomerContact.findOrCreate({
                            where: {
                                customerId: customer.id,
                                contactId: contact.id
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

                        return {
                            statusCode: 204,
                            headers: corsHeaders
                        }



                    } case 'location': {

                        const location = await Location.findOne({
                            where: {
                                id: id,
                                brokerageId: user.brokerageId
                            }
                        })

                        if (location === null) {
                            return {
                                statusCode: 404,
                                headers: corsHeaders
                            }
                        }

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

                        return {
                            statusCode: 204,
                            headers: corsHeaders
                        }


                    } default: {

                        return {
                            statusCode: 500,
                            headers: corsHeaders
                        }

                    }

                }

            } else {

                switch (type) {
                    case 'customer': {

                        const customer = await Customer.findOne({
                            where: {
                                id: id,
                                brokerageId: user.brokerageId
                            }
                        })

                        if (customer === null) {
                            return {
                                statusCode: 404,
                                headers: corsHeaders
                            }
                        }

                        await CustomerContact.findOrCreate({
                            where: {
                                customerId: customer.id,
                                contactId: contact.id
                            }
                        })

                        return {
                            statusCode: 204,
                            headers: corsHeaders
                        }

                    } case 'location': {

                        const location = await Location.findOne({
                            where: {
                                id: id,
                                brokerageId: user.brokerageId
                            }
                        })

                        if (location === null) {
                            return {
                                statusCode: 404,
                                headers: corsHeaders
                            }
                        }

                        await LocationContact.findOrCreate({
                            where: {
                                locationId: location.id,
                                contactId: contact.id
                            }
                        })

                        return {
                            statusCode: 204,
                            headers: corsHeaders
                        }

                    } case 'lane': {

                        const lane = await Lane.findOne({
                            where: {
                                id: id,
                                brokerageId: user.brokerageId
                            }
                        })

                        if (lane === null) {
                            return {
                                statusCode: 404,
                                headers: corsHeaders
                            }
                        }

                        await LaneContact.findOrCreate({
                            where: {
                                laneId: lane.id,
                                contactId: contact.id
                            }
                        })

                        return {
                            statusCode: 204,
                            headers: corsHeaders
                        }

                    } default: {

                        return {
                            statusCode: 500,
                            headers: corsHeaders
                        }

                    }
                }
            }
        }

        else {

            const contact = await Contact.create({
                brokerageId: user.brokerageId,
                firstName: request.firstName,
                lastName: request.lastName,
                phoneExt: request.phoneExt,
                phone: request.phone,
                email: request.email,
                level: request.level,
                title: request.title
            })

            if (universal == 'true') {

                switch (type) {
                    case 'customer': {

                        const customer = await Customer.findOne({
                            where: {
                                id: id,
                                brokerageId: user.brokerageId
                            }
                        })

                        if (customer === null) {
                            return {
                                statusCode: 404,
                                headers: corsHeaders
                            }
                        }

                        await CustomerContact.findOrCreate({
                            where: {
                                customerId: customer.id,
                                contactId: contact.id
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

                        return {
                            statusCode: 204,
                            headers: corsHeaders
                        }

                    } case 'location': {

                        const location = await Location.findOne({
                            where: {
                                id: id,
                                brokerageId: user.brokerageId
                            }
                        })

                        if (location === null) {
                            return {
                                statusCode: 404,
                                headers: corsHeaders
                            }
                        }

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

                        return {
                            statusCode: 204,
                            headers: corsHeaders
                        }

                    } default: {

                        return {
                            statusCode: 500,
                            headers: corsHeaders
                        }
                    }
                }
            } else {

                switch (type) {
                    case 'customer': {

                        const customer = await Customer.findOne({
                            where: {
                                id: id,
                                brokerageId: user.brokerageId
                            }
                        })

                        if (customer === null) {
                            return {
                                statusCode: 404,
                                headers: corsHeaders
                            }
                        }

                        await CustomerContact.findOrCreate({
                            where: {
                                customerId: customer.id,
                                contactId: contact.id
                            }
                        })

                        return {
                            statusCode: 204,
                            headers: corsHeaders
                        }

                    } case 'location': {

                        const location = await Location.findOne({
                            where: {
                                id: id,
                                brokerageId: user.brokerageId
                            }
                        })

                        if (location === null) {
                            return {
                                statusCode: 404,
                                headers: corsHeaders
                            }
                        }

                        await LocationContact.findOrCreate({
                            where: {
                                locationId: location.id,
                                contactId: contact.id
                            }
                        })

                        return {
                            statusCode: 204,
                            headers: corsHeaders
                        }

                    } case 'lane': {

                        const lane = await Lane.findOne({
                            where: {
                                id: id,
                                brokerageId: user.brokerageId
                            }
                        })

                        if (lane === null) {
                            return {
                                statusCode: 404,
                                headers: corsHeaders
                            }
                        }

                        await LaneContact.findOrCreate({
                            where: {
                                laneId: lane.id,
                                contactId: contact.id
                            }
                        })

                        return {
                            statusCode: 204,
                            headers: corsHeaders
                        }

                    } default: {

                        return {
                            statusCode: 500,
                            headers: corsHeaders
                        }

                    }
                }
            }

        }
    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.editContact = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401,
                headers: corsHeaders
            }
        }

        const request = JSON.parse(event.body)
        const id = request.id

        const contact = await Contact.findOne({
            where: {
                id: id,
                brokerageId: user.brokerageId
            }
        })

        if (contact === null) {
            return {
                statusCode: 404,
                headers: corsHeaders
            }
        }

        contact.firstName = request.firstName
        contact.lastName = request.lastName
        contact.title = request.title
        contact.phoneExt = request.phoneExt
        contact.phone = request.phone
        contact.email = request.email
        contact.level = request.level

        await contact.save()

        return {
            statusCode: 204,
            headers: corsHeaders
        }
    } catch (err) {

        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}

module.exports.deleteContact = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401,
                headers: corsHeaders
            }
        }

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

                const lane = await Lane.findOne({
                    where: {
                        id: request.LaneContact.laneId
                    }
                })

                if (lane.brokerageId != user.brokerageId) {
                    return {
                        statusCode: 403,
                        headers: corsHeaders
                    }
                }

                if (laneContact === null) {

                    return {
                        statusCode: 404,
                        headers: corsHeaders
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
                        statusCode: 204,
                        headers: corsHeaders
                    }
                }

                return {
                    body: JSON.stringify(contact),
                    statusCode: 200,
                    headers: corsHeaders
                }

            } case 'location': {

                const locationContact = await LocationContact.findOne({
                    where: {
                        locationId: request.LocationContact.locationId,
                        contactId: request.LocationContact.contactId
                    }
                })

                const location = await Location.findOne({
                    where: {
                        id: request.LocationContact.locationId
                    }
                })

                if (location.brokerageId != user.brokerageId) {
                    return {
                        statusCode: 403,
                        headers: corsHeaders
                    }
                }

                if (locationContact === null) {
                    return {
                        statusCode: 404,
                        headers: corsHeaders
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
                        headers: corsHeaders,
                        statusCode: 200
                    }
                }

                return {
                    body: JSON.stringify(contact),
                    statusCode: 200,
                    headers: corsHeaders
                }

            } case 'customer': {

                const customerContact = await CustomerContact.findOne({
                    where: {
                        customerId: request.CustomerContact.customerId,
                        contactId: request.CustomerContact.contactId
                    }
                })

                const customer = await Customer.findOne({
                    where: {
                        id: request.CustomerContact.customerId
                    }
                })

                if (customer.brokerageId != user.brokerageId) {
                    return {
                        statusCode: 403,
                        headers: corsHeaders
                    }
                }

                if (customerContact === null) {
                    return {
                        statusCode: 404,
                        headers: corsHeaders
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
                        statusCode: 200,
                        headers: corsHeaders
                    }
                }

                return {
                    body: JSON.stringify(contact),
                    statusCode: 200,
                    headers: corsHeaders
                }

            } default: {

                return {
                    statusCode: 500,
                    headers: corsHeaders
                }
            }
        }
    } catch (err) {
        console.log(err)
        return {
            statusCode: 500,
            headers: corsHeaders
        }
    }
}