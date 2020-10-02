'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser

const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace',
    apiVersion: '7.7'
});

module.exports.search = async (event, context) => {

    try {
    const user = await getCurrentUser(event.headers.Authorization)

    const query = event.queryStringParameters.q

    const results = await client.search({
        index: '*',
        q: `${query}*`
    })

    const userResults = await results.hits.hits.filter(item => item._source.brokerageId == user.brokerageId)

    return {
        body: JSON.stringify(userResults),
        statusCode: 200
    }
    } catch (err) {

        return {
            statusCode:500
        }
    }
}