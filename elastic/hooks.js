const elasticsearch = require('elasticsearch');
const getIndex = require('../helpers/getIndexName').getIndexName
const { Customer, Lane, LanePartner, Team, CustomerLane, CustomerLocation, User, Message, Ledger } = require('.././models');
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

    try {
        const indexName = await getIndex(item)

        const newProperties = item.changed()

        const newValues = {}

        for (const key of newProperties) {
            newValues[key] = item[key]
        }

        if (indexName == 'message') {

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
        }

        else {
            await client.update({
                index: indexName,
                id: item.id,
                body: {
                    doc: newValues,
                    doc_as_upsert: true
                },
            })
        }

    } catch (err) {

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
