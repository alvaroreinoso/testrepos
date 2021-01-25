const elasticsearch = require('@elastic/elasticsearch');
require('dotenv').config()

const client = new elasticsearch.Client({
    // connectionClass: AWSConnector,
    // node: process.env.SEARCH_URL,
    node: process.env.SEARCH_URL,
    // node: `${process.env.SEARCH_USER}:${process.env.SEARCH_PASSWORD}@${process.env.SEARCH_URL}`,
    // node: `https://${process.env.SEARCH_USER}:${process.env.SEARCH_PASSWORD}@search-staging-search-4xcqqvyidrf22wjiokahpzkwvy.us-east-1.es.amazonaws.com`,
    // auth: {
    //     username: process.env.SEARCH_USER,
    //     password: process.env.SEARCH_PASSWORD
    // },
    log: [{
        type: 'stdio',
        levels: ['error']
    }],
    // apiVersion: '7.7'
});

module.exports = client;