var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: [{
        type: 'stdio',
        levels: ['error']
    }],
    apiVersion: '7.7'
});

module.exports.updateCustomerLocation = async (customerLocation) => {

    await client.update({
        index: 'customer_location',
        id: customerLocation.id,
        body: {
            doc: {
                id: customerLocation.id,
                address: customerLocation.address,
                address2: customerLocation.address2,
                city: customerLocation.city,
                state: customerLocation.state,
                zipcode: customerLocation.zipcode,
            },
            doc_as_upsert: true
        }
    })
}

module.exports.destroyCustomerLocation = async (customerLocation) => {

    await client.delete({
        index: 'customer_location',
        id: customerLocation.id
    })
}