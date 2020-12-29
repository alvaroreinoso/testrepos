const elasticsearch = require('elasticsearch');
require('dotenv').config()

const client = new elasticsearch.Client({
    host: process.env.SEARCH_URL,
    log: [{
        type: 'stdio',
        levels: ['error']
    }],
    apiVersion: '7.7'
});

module.exports = client;