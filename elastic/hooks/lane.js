var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: [{
        type: 'stdio',
        levels: ['error']
    }],
    apiVersion: '7.7'
});

module.exports.updateLane = async (lane) => {

    await client.update({
        index: 'lane',
        id: lane.id,
        body: {
            doc: {
                id: lane.id,
                origin: lane.origin,
                destination: lane.destination,
            },
            doc_as_upsert: true
        }
    })
}

module.exports.destroyLane = async (lane) => {

    await client.delete({
        index: 'lane',
        id: lane.id
    })
}
