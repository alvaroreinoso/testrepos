const elasticsearch = require('elasticsearch');
const client = require('./client')

client.indices.delete({
    index: '*'
})