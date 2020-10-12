var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: [{
        type: 'stdio',
        levels: ['error']
    }],
    apiVersion: '7.7'
});

module.exports.updateTeam = async (team) => {

    await client.update({
        index: 'team',
        id: team.id,
        body: {
            doc: {
                id: team.id,
                name: team.name,
                brokerageId: team.brokerageId,
                icon: team.icon
            },
            doc_as_upsert: true
        }
    })
}

module.exports.destroyTeam = async (team) => {

    await client.delete({
        index: 'team',
        id: team.id
    })
}