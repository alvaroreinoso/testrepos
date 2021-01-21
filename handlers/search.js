'use strict';
const { Ledger, Message, User, Brokerage, Contact } = require('.././models');
const client = require('.././elastic/client')
const { getCurrentUser } = require('.././helpers/user')
const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.ORIGIN_URL,
    'Access-Control-Allow-Credentials': true,
}

module.exports.search = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {

            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        const query = event.queryStringParameters.q

        const searchResults = await client.search({
            index: ['lane_partner', 'customer', 'user', 'team', 'lane', 'customer_location'],
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
                        filter: [
                            { "term": { "brokerageId": user.brokerageId } }
                        ]
                    }
                }
            }
        })

        return {
            body: JSON.stringify(searchResults.hits.hits),
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

    const dbResults = searchResults.hits.hits.map(message => {

        const results = Message.findOne({
            where: {
                id: message._id
            },
            include: [{
                model: User,
                attributes: ['id', 'firstName', 'lastName', 'profileImage', 'teamId', 'title'],
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
        headers: corsHeaders,
        statusCode: 200
    }
}

module.exports.searchUsersInBrokerage = async (event, context) => {

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

        const dbResults = searchResults.hits.hits.map(user => {

            const results = User.findOne({
                where: {
                    id: user._id
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

        const dbResults = searchResults.hits.hits.map(contact => {

            const results = Contact.findOne({
                where: {
                    id: contact._id
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