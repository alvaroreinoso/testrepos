'use strict';

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace',
    apiVersion: '7.7', // use the same version of your Elasticsearch instance
});

module.exports.search = async (event, context) => {

    const query = event.queryStringParameters.q

    console.log(query)

    const results = await client.search({
        index: 'customer',
        q: query,
        pretty: true
    })

    // const final = await results.hits.hits.forEach(item => {
    //     if (item._source.userId == 14) {

    //     }
    // })
    return {
        body: JSON.stringify(results.hits.hits),
        statusCode: 200
    }
}