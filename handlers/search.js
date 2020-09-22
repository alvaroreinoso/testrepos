'use strict';

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace',
    apiVersion: '7.7'
});

module.exports.search = async (event, context) => {

    const query = event.queryStringParameters.q

    const results = await client.search({
        index: '*',
        q: `${query}*`
    })

    return {
        body: JSON.stringify(results.hits.hits),
        statusCode: 200
    }
}