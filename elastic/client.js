const elasticsearch = require('@elastic/elasticsearch');
require('dotenv').config()

const client = new elasticsearch.Client({
  node: process.env.SEARCH_URL,
  apiVersion: '7.10'
});

client.on('response', (err, result) => {
  if (err) {
    console.log(err)
  }
})

module.exports = client;