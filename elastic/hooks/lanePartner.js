var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: [{
        type: 'stdio',
        levels: ['error']
    }],
    apiVersion: '7.7'
});

module.exports.updateLanePartner = async (lanePartner) => {

    await client.update({
        index: 'lane_partner',
        id: lanePartner.id,
        body: {
            doc: {
                id: lanePartner.id,
                name: lanePartner.name,
                address: lanePartner.address,
                address2: lanePartner.address2,
                city: lanePartner.city,
                state: lanePartner.state,
                zipcode: lanePartner.zipcode,
                lnglat: lanePartner.lnglat,
                open: lanePartner.open,
                close: lanePartner.close,
                title: lanePartner.title,
            },
            doc_as_upsert: true
        }
    })
}

module.exports.destroyLanePartner = async (lanePartner) => {

    await client.delete({
        index: 'lane_partner',
        id: lanePartner.id
    })
}
