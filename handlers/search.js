'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Ledger, Message, User } = require('.././models');

const elasticsearch = require('elasticsearch');
const client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: [{
        type: 'stdio',
        levels: ['error']
    }],
    apiVersion: '7.7'
});

module.exports.search = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        const query = event.queryStringParameters.q

        const results = await client.search({
            index: ['lane_partner', 'customer', 'teammate', 'team', 'lane', 'customer_location'],
            q: `${query}*`
        })

        const userResults = await results.hits.hits.filter(item => item._source.brokerageId == user.brokerageId)

        return {
            body: JSON.stringify(userResults),
            statusCode: 200
        }
    } catch (err) {

        return {
            statusCode: 500
        }
    }
}

module.exports.searchLedger = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    const ledgerId = event.queryStringParameters.id

    const ledger = await Ledger.findOne({
        where: {
            id: ledgerId,
            brokerageId: user.brokerageId
        }
    })

    if (ledger == null) {

        return {
            statusCode: 401
        }
    }

    const query = event.queryStringParameters.q

    const searchResults = await client.search({
        index: 'message',
        body: {
            query: {
                bool: {
                    must: [
                        {
                            multi_match: {
                                query: query,
                                type: "phrase_prefix",
                                fields: ["content", "userFirstName", "userLastName"]
                            }
                        },
                    ],
                    filter: [
                        { "term": { "ledgerId": ledgerId } }
                    ]
                }
            }
        }
    })

    const dbResults = searchResults.hits.hits.map(message => {

        const results = Message.findOne({
            where: {
                id: message._id
            },
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'profileImage', 'teamId'],
            }]
        })

        return results
    })

    const response = await Promise.all(dbResults)

    function compare(a, b) {
        if (a.createdAt < b.createdAt) return 1;
        if (b.createdAt > a.createdAt) return -1;

        return 0;
    }

    const sortedResults = response.sort(compare)

    return {
        body: JSON.stringify(sortedResults),
        statusCode: 200
    }
}