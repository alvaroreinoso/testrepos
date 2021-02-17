const stateAbbreviations = require('states-abbreviations')
const elasticsearch = require('@elastic/elasticsearch');
const getIndex = require('../helpers/getIndexName').getIndexName
const { Customer, Lane, Location, CustomerLocation, Contact, Ledger } = require('.././models');
const client = require('./client')

module.exports.saveDocument = async (item) => {

    try {
        const indexName = await getIndex(item)

        const newProperties = item.changed()

        const newValues = {}

        for (const key of newProperties) {
            newValues[key] = item[key]
        }

        switch (indexName) {

            case 'message': {

                const ledger = await item.getLedger()

                const user = await item.getUser()

                await client.update({
                    index: 'message',
                    id: item.id,
                    body: {
                        doc: {
                            id: item.id,
                            content: item.content,
                            ledgerId: item.ledgerId,
                            brokerageId: ledger.brokerageId,
                            userFirstName: user.firstName,
                            userLastName: user.lastName
                        },
                        doc_as_upsert: true
                    },
                })

                break;
            }

            case 'customer': {

                const customer = {
                    id: item.id,
                    name: item.name,
                    brokerageId: item.brokerageId
                }

                await client.update({
                    index: indexName,
                    id: item.id,
                    body: {
                        doc: customer,
                        doc_as_upsert: true
                    },
                })

                break;
            }

            case 'customer_location': {

                const customer = await item.getCustomer()

                const location = await item.getLocation()

                const stateName = stateAbbreviations[location.state]

                const customerLocation = {
                    id: item.id,
                    customerName: customer.name,
                    address: location.address,
                    city: location.city,
                    state: location.state,
                    fullState: stateName,
                    zipcode: location.zipcode,
                    brokerageId: customer.brokerageId
                }

                await client.update({
                    index: indexName,
                    id: item.id,
                    body: {
                        doc: customerLocation,
                        doc_as_upsert: true
                    },
                })

                break;
            }

            case 'lane_partner': {

                const location = await item.getLocation()
                const ledger = await location.getLedger()
                const stateName = stateAbbreviations[location.state]

                const lanePartner = {
                    id: item.id,
                    name: item.name,
                    address: location.address,
                    city: location.city,
                    state: location.state,
                    fullState: stateName,
                    zipcode: location.zipcode,
                    brokerageId: ledger.brokerageId
                }

                await client.update({
                    index: indexName,
                    id: item.id,
                    body: {
                        doc: lanePartner,
                        doc_as_upsert: true
                    },
                })

                break;
            }

            case 'lane': {

                const origin = await item.getOrigin()

                const destination = await item.getDestination()

                const route = `${origin.city} ${origin.state} to ${destination.city} ${destination.state}`
                const shortRoute = `${origin.city} to ${destination.city}`

                const originState = stateAbbreviations[origin.state]
                const destinationState = stateAbbreviations[destination.state]

                const lane = {
                    id: item.id,
                    origin: origin.city,
                    originStateName: originState,
                    destination: destination.city,
                    destinationStateName: destinationState,
                    route: route,
                    shortRoute: shortRoute,
                    // brokerageId: brokerageId[0]
                }

                await client.update({
                    index: indexName,
                    id: item.id,
                    body: {
                        doc: lane,
                        doc_as_upsert: true
                    },
                })

                break
            }

            case 'team': {

                const team = {
                    id: item.id,
                    name: item.name,
                    brokerageId: item.brokerageId,
                    icon: item.icon
                }

                await client.update({
                    index: indexName,
                    id: item.id,
                    body: {
                        doc: team,
                        doc_as_upsert: true
                    },
                })

                break
            }
            case 'user': {

                const user = {
                    id: item.id,
                    title: item.title,
                    firstName: item.firstName,
                    lastName: item.lastName,
                    fullName: item.fullName,
                    email: item.email,
                    phone: item.phone,
                    brokerageId: item.brokerageId
                }

                await client.update({
                    index: indexName,
                    id: item.id,
                    body: {
                        doc: user,
                        doc_as_upsert: true
                    },
                })

                break
            }
            case 'brokerage': {

                const brokerage = {
                    id: item.id,
                    name: item.name,
                    brokerageId: item.id
                }

                await client.update({
                    index: indexName,
                    id: item.id,
                    body: {
                        doc: brokerage,
                        doc_as_upsert: true
                    },
                })

                break
            }

            default: {

                console.log('Hit default: ', indexName)
            }
        }

    } catch (err) {
        console.log(err)
    }

}

module.exports.saveLane = async (item, user) => {

    const origin = await item.getOrigin()

    const destination = await item.getDestination()

    const brokerageId = user.brokerageId

    const route = `${origin.city} ${origin.state} to ${destination.city} ${destination.state}`
    const shortRoute = `${origin.city} to ${destination.city}`

    const originState = stateAbbreviations[origin.state]
    const destinationState = stateAbbreviations[destination.state]

    const lane = {
        id: item.id,
        origin: origin.city,
        originStateName: originState,
        destination: destination.city,
        destinationStateName: destinationState,
        route: route,
        shortRoute: shortRoute,
        brokerageId: brokerageId
    }

    await client.update({
        index: 'lane',
        id: item.id,
        body: {
            doc: lane,
            doc_as_upsert: true
        },
    })

}

module.exports.deleteDocument = async (item) => {

    try {
        const indexName = await getIndex(item)

        await client.delete({
            index: indexName,
            id: item.id
        })
    } catch (err) {

    }
}

module.exports.saveContact = async (contact, brokerageId) => {

    const doc = {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        fullName: `${contact.firstName} ${contact.lastName}`,
        title: contact.title,
        brokerageId: brokerageId
    }

    await client.update({
        index: 'contact',
        id: contact.id,
        body: {
            doc: doc,
            doc_as_upsert: true
        },
    })
}

module.exports.editContact = async (contact) => {

    const doc = {
        id: contact.id,
        firstName: contact.firstName,
        lastName: contact.lastName,
        fullName: `${contact.firstName} ${contact.lastName}`,
    }

    await client.update({
        index: 'contact',
        id: contact.id,
        body: {
            doc: doc,
            doc_as_upsert: true
        },
    })
}
