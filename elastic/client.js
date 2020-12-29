const elasticsearch = require('elasticsearch');
require('dotenv').config()

const client = new elasticsearch.Client({
    // host: 'localhost:9200',
    host: process.env.SEARCH_URL,
    log: [{
        type: 'stdio',
        levels: ['error']
    }],
    apiVersion: '7.7'
});

module.exports = client;