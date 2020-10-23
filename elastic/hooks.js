const elasticsearch = require('elasticsearch');
const getIndex = require('../helpers/getIndexName').getIndexName
const client = new elasticsearch.Client({
    host: 'localhost:9200',
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

        await client.update({
            index: indexName,
            id: item.id,
            body: {
                doc: newValues,
                doc_as_upsert: true
            },
        })
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
