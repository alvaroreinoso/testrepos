var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace',
    apiVersion: '7.7', // use the same version of your Elasticsearch instance
});
const customers = require('./data/customers')

client.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: 1000
}, function (error) {
    if (error) {
        console.trace('elasticsearch cluster is down!');
    } else {
        console.log('All is well');
    }
});


// client.indices.create({
//     index: "user"
// })


// client.indices.create({
//     index: 'customer',
//     body: {
//         mappings: {
//             properties: {
//                 name: { "type": "text" },
//                 industry: { "type": "text" },
//                 userId: { "type": "integer" },
//                 teamId: { "type": "integer" },
//             }
//         }
//     }
// })

// customers.forEach((cust, i) => {
//     client.create({ 
//         index: 'customer',
//         id: i,
//         body: {
//             name: cust.name,
//             industry: cust.industry,
//             userId: cust.userId,
//             teamId: 1
//         }
//     })
// })

// const body = {
//     user:{
//         properties:{
//             tag         : {"type" : "string", "index" : "not_analyzed"},
//             type        : {"type" : "string", "index" : "not_analyzed"},
//             namespace   : {"type" : "string", "index" : "not_analyzed"},
//             tid         : {"type" : "string", "index" : "not_analyzed"}
//         }
//     }
// }

// client.indices.putMapping({index:"users", body:body});

// client.create({
//     index: 'user',
//     id: 1,
//     body: {
//         tag: 'test',
//         type: 'test',
//         namespace: 'test',
//         tid: 'test'
//     }
// })

// client.get({
//     index: 'user',
//     id: 1
// })

client.search({
    index: 'customer',
    q: '13'
})