var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: [{
        type: 'stdio',
        levels: ['error']
    }],
    apiVersion: '7.7'
});

module.exports.updateMessage = async (message) => {

    await client.update({
        index: 'message',
        id: message.id,
        body: {
            doc: {
                content: message.content,
                ledgerId: message.ledgerId,
                userId: message.userId
            },
            doc_as_upsert: true
        }
    })
}

module.exports.destroyMessage = async (message) => {

    await client.delete({
        index: 'message',
        id: message.id
    })
}
