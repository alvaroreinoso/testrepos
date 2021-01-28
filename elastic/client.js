const elasticsearch = require('@elastic/elasticsearch');
require('dotenv').config()

const client = new elasticsearch.Client({
    node: process.env.SEARCH_URL,
    log: 'trace',
    // log: [{
    //     type: 'stdio',
    //     levels: 'trace'
    //     // levels: ['error']
    // }],
    apiVersion: '7.10'
});

client.on('response', (err, result) => {
    if (err) {
      console.log(err)
    } else {
      console.log(result)
    }
  })

module.exports = client;