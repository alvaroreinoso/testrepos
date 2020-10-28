const elasticsearch = require('elasticsearch');
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

                await client.update({
                    index: indexName,
                    id: item.id,
                    body: {
                        doc: newValues,
                        doc_as_upsert: true
                    },
                })

                break;
            }

            case 'customer_location': {

                const customer = await item.getCustomer()

                const ledger = await customer.getLedger()

                newValues.brokerageId = ledger.brokerageId

                console.log(newValues)

                await client.update({
                    index: indexName,
                    id: item.id,
                    body: {
                        doc: newValues,
                        doc_as_upsert: true
                    },
                })

                break;
            }

            case 'lane_partner': {

                console.log('\n')
                console.log('\n')
                console.log('\n')
                console.log('\n')

                console.log(item)

                console.log(indexName)

                console.log(item.id)

                const lanePartner = await LanePartner.findOne({
                    where: {
                        id: item.id
                    },
                    include: [{
                        model: CustomerLane,
                        required: true,
                    //     include: [{
                    //         model: CustomerLocation,
                    //         required: true,
                    //         include: [{
                    //             model: Customer,
                    //             required: true,
                    //             include: [{
                    //                 model: Ledger,
                    //                 required: true
                    //             }]
                    //         }]
                    //     }]
                    }]
                })

                console.log(await lanePartner.toJSON())

                // const customerLane = await item.getCustomerLane()

                console.log('\n')
                console.log('\n')
                console.log('\n')
                console.log('\n')
                console.log('\n')

                // console.log(customerLane)

                // const location = await customerLane.getCustomerLocation()

                // const customer = await location.getCustomer()

                // const ledger = await customer.getLedger()

                newValues.brokerageId = ledger.brokerageId

                await client.update({
                    index: indexName,
                    id: item.id,
                    body: {
                        doc: newValues,
                        doc_as_upsert: true
                    },
                })

                break;
            }

            default: {
                console.log(indexName)

                await client.update({
                    index: indexName,
                    id: item.id,
                    body: {
                        doc: newValues,
                        doc_as_upsert: true
                    },
                })
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
