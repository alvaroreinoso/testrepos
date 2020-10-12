var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: [{
        type: 'stdio',
        levels: ['error']
    }],
    apiVersion: '7.7'
});

module.exports.updateCustomer = async (customer) => {

    await client.update({
        index: 'customer',
        id: customer.id,
        body: {
            doc: {
                id: customer.id,
                name: customer.name,
                industry: customer.industry,
                userId: customer.userId,
                teamId: customer.teamId,
                brokerageId: customer.Team.brokerageId
            },
            doc_as_upsert: true
        }
    })
}

module.exports.destroyCustomer = async (customer) => {

    await client.delete({
        index: 'customer',
        id: customer.id
    })
}