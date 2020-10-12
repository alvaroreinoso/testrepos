var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace',
    //     type: 'stdio',
    //     // levels: ['error']
    // }],
    apiVersion: '7.7'
});

module.exports.updateMessage = async (item) => {

    const camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

    const modelName = item.constructor.getTableName()
    const indexName = camelToSnakeCase(modelName.toLowerCase().slice(0, -1))

    const newProperties = item.changed()

    const newValues = {}

    for (const key of newProperties) {
         newValues[key] = item[key]
    }

    await client.update({
        index: indexName,
        id: item.id,
        body: {
            doc: newValues,
            doc_as_upsert: true
        },
    })
}

module.exports.destroyMessage = async (item) => {

    const camelToSnakeCase = str => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

    const modelName = item.constructor.getTableName()
    const indexName = camelToSnakeCase(modelName.toLowerCase().slice(0, -1))

    await client.delete({
        index: indexName,
        id: item.id
    })
}
