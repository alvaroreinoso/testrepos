const elasticsearch = require('elasticsearch');
const stateAbbreviations = require('states-abbreviations')
const getIndex = require('../helpers/getIndexName').getIndexName
const client = new elasticsearch.Client({
    host: 'localhost:9200',
    // log: 'trace',
    log: [{
        type: 'stdio',
        levels: ['error']
    }],
    apiVersion: '7.7'
});


module.exports.saveDocument = async (item) => {

    const { Customer, Lane, LanePartner, Team, CustomerLane, CustomerLocation, User, Message, Ledger } = require('.././models');

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

                const ledger = await item.getLedger()

                newValues.brokerageId = ledger.brokerageId

                newValues.id = item.id

                const customer = {
                    name: item.name,
                    brokerageId: ledger.brokerageId
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

                const ledger = await customer.getLedger()

                const location = await item.getLocation()

                const stateName = stateAbbreviations[location.state]

                const customerLocation = {
                    customerName: customer.name,
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

                const origin = await item.getOrigin({
                    include: [{
                        model: CustomerLocation,
                        include: [{
                            model: Customer,
                            required: true,
                            include: [{
                                model: Ledger,
                                required: true
                            }]
                        }]
                    }]
                })

                const destination = await item.getDestination({
                    include: [{
                        model: CustomerLocation,
                        include: [{
                            model: Customer,
                            required: true,
                            include: [{
                                model: Ledger,
                                required: true
                            }]
                        }]
                    }]
                })

                let brokerageId = []

                if (origin.CustomerLocation == null) {

                    brokerageId.push(destination.CustomerLocation.Customer.Ledger.brokerageId)

                } else {

                    brokerageId.push(origin.CustomerLocation.Customer.Ledger.brokerageId)
                }

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
                    brokerageId: brokerageId[0]
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

            case 'brokerage': {

                const brokerage = {
                    name: item.name,
                    brokerageId: item.id
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
                    name: item.name,
                    brokerageId: item.brokerageId
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
            case 'brokerage': {

                const brokerage = {
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

                // await client.update({
                //     index: indexName,
                //     id: item.id,
                //     body: {
                //         doc: newValues,
                //         doc_as_upsert: true
                //     },
                // })

                console.log('Hit default: ', indexName)
            }
        }

    } catch (err) {
        console.log(err)
    }

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
