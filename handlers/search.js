'use strict';
const { Ledger, Message, User, Brokerage, Contact, Team } = require('.././models');
const client = require('.././elastic/client')
const getCurrentUser = require('.././helpers/user')
const corsHeaders = require('.././helpers/cors')

module.exports.search = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id === null) {
            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        const query = event.queryStringParameters.q

        const searchResults = await client.search({
            index: ['lane_partner', 'customer', 'user', 'team', 'lane', 'customer_location', 'brokerage'],
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                multi_match: {
                                    query: query,
                                    type: "phrase_prefix",
                                    fields: '*'
                                }
                            },
                        ],
                        must_not: [
                            {
                                multi_match: {
                                    query: query,
                                    type: "phrase_prefix",
                                    fields: 'laneCustomerName'
                                }
                            }
                        ],
                        filter: [
                            { "term": { "brokerageId": user.brokerageId } }
                        ]
                    }
                }
            }
        })

        return {
            body: JSON.stringify(searchResults.body.hits.hits),
            headers: corsHeaders,
            statusCode: 200
        }

    } catch (err) {
        console.log(err)
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }
}

module.exports.searchLedger = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

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
            headers: corsHeaders,
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

    console.log(searchResults.body.hits.hits)

    const dbResults = searchResults.body.hits.hits.map(message => {

        const results = Message.findOne({
            where: {
                id: message._source.id
            },
            include: {
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'profileImage', 'teamId', 'title'],
                include: {
                    model: Team
                }
            }
           
        })

        return results
    })

    const response = await Promise.all(dbResults)

    function compare(a, b) {
        // if (a.createdAt < b.createdAt) return -1;
        // if (b.createdAt > a.createdAt) return 1;

        // return 0;
    }

    const sortedResults = await response.sort(compare)

    return {
        body: JSON.stringify(sortedResults),
        headers: corsHeaders,
        statusCode: 200
    }
}

module.exports.searchUsersInBrokerage = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {

        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {

            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        const brokerage = await Brokerage.findOne({
            where: {
                id: user.brokerageId
            }
        })

        const brokerageId = brokerage.id

        const query = event.queryStringParameters.q

        const searchResults = await client.search({
            index: 'user',
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                multi_match: {
                                    query: query,
                                    type: "phrase_prefix",
                                    fields: ["firstName", "lastName", "fullName"]
                                }
                            },
                        ],
                        filter: [
                            { "term": { "brokerageId": brokerageId } }
                        ]
                    }
                }
            }
        })

        const dbResults = searchResults.body.hits.hits.map(user => {

            const results = User.findOne({
                where: {
                    id: user._source.id
                },
                include: {
                    model: Team        
                }
            })

            return results
        })

        const response = await Promise.all(dbResults)

        return {
            body: JSON.stringify(response),
            headers: corsHeaders,
            statusCode: 200
        }

    } catch (err) {

        console.log(err)
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }
}

module.exports.searchContacts = async (event, context) => {

    if (event.source === 'serverless-plugin-warmup') {
        console.log('WarmUp - Lambda is warm!');
        return 'Lambda is warm!';
    }

    try {

        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {

            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        const brokerage = await Brokerage.findOne({
            where: {
                id: user.brokerageId
            }
        })

        const brokerageId = brokerage.id

        const query = event.queryStringParameters.q

        const searchResults = await client.search({
            index: 'contact',
            body: {
                query: {
                    bool: {
                        must: [
                            {
                                multi_match: {
                                    query: query,
                                    type: "phrase_prefix",
                                    fields: ["firstName", "lastName", "fullName"]
                                }
                            },
                        ],
                        filter: [
                            { "term": { "brokerageId": brokerageId } }
                        ]
                    }
                }
            }
        })

        const dbResults = searchResults.body.hits.hits.map(contact => {

            const results = Contact.findOne({
                where: {
                    id: contact._source.id
                }
            })

            return results
        })

        const response = await Promise.all(dbResults)

        return {
            body: JSON.stringify(response),
            headers: corsHeaders,
            statusCode: 200
        }

    } catch (err) {

        console.log(err)
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }
}