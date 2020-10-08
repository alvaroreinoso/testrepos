var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log : [{
        type: 'stdio',
        levels: ['error']
    }],
    apiVersion: '7.7'
});

module.exports.updateMessage = async (message) => {

    console.log(message.id, message.content)

    client.update({
        index: 'message',
        id: message.id,
        body: { doc:
            {
            content: message.content
        }}
    }
    )
}
