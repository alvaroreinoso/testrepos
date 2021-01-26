const elasticsearch = require('@elastic/elasticsearch');
require('dotenv').config()

const client = new elasticsearch.Client({
    node: process.env.SEARCH_URL,
    log: [{
        type: 'stdio',
        levels: ['error']
    }],
    apiVersion: '7.10'
});

module.exports = client;