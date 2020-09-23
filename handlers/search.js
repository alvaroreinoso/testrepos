'use strict';

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace',
    apiVersion: '7.7'
});

module.exports.search = async (event, context) => {

    const userBrokerageId = 2 // should come from session storage or redis???

    const query = event.queryStringParameters.q

    const results = await client.search({
        index: '*',
        q: `${query}*`
    })

    const userResults = await results.hits.hits.filter(item => item._source.brokerageId == userBrokerageId)

    return {
        body: JSON.stringify(userResults),
        statusCode: 200
    }
}