const elasticsearch = require('elasticsearch');
require('dotenv').config()

const client = new elasticsearch.Client({
    // host: process.env.SEARCH_URL,
    node: process.env.SEARCH_URL,
    auth: {
        username: process.env.SEARCH_USER,
        password: process.env.SEARCH_PASSWORD
    },
    log: [{
        type: 'stdio',
        levels: ['error']
    }],
    apiVersion: '7.7'
});

module.exports = client;