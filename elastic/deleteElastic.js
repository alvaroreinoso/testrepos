var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace',
    apiVersion: '7.7', // use the same version of your Elasticsearch instance
});

client.indices.delete({
    index: '*'
})