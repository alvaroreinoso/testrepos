'use strict';
const getCurrentUser = require('.././helpers/user')
const { Ledger, Message, Customer, User, Team } = require('.././models');
const corsHeaders = require('.././helpers/cors')

module.exports.getLedger = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                statusCode: 401,
                headers: corsHeaders
            }
        }

        const ledgerId = event.pathParameters.id

        const ledger = await Ledger.findOne({
            where: {
                id: ledgerId,
                brokerageId: user.brokerageId
            },
            include: [{
                model: Message,
                include: [{
                    model: User,
                    paranoid: false,
                    include: {
                        model: Team
                    }
                }]
            }, {
                model: User,
            },
            {
                model: Customer
            }],
            order: [
                [Message, 'id', 'DESC']
            ]
        })

        if (ledger == null) {
            return {
                headers: corsHeaders,
                statusCode: 404
            }
        }

        return {
            body: JSON.stringify(ledger),
            headers: corsHeaders,
            statusCode: 200
        }
    } catch (err) {
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }

}

module.exports.writeMessage = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        const request = JSON.parse(event.body)

        const ledger = await Ledger.findOne({
            where: {
                id: request.ledgerId,
                brokerageId: user.brokerageId
            }
        })

        if (ledger == null) {
            return {
                headers: corsHeaders,
                statusCode: 404
            }
        }

        const message = await Message.create({
            userId: user.id,
            ledgerId: request.ledgerId,
            content: request.content
        })

        return {
            headers: corsHeaders,
            statusCode: 204
        }

    } catch (err) {
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }
}

module.exports.updateMessage = async (event, context) => {

    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == null) {
            return {
                headers: corsHeaders,
                statusCode: 401
            }
        }

        const method = event.httpMethod

        const messageId = event.pathParameters.id

        const message = await Message.findOne({
            where: {
                id: messageId,
                userId: user.id
            }
        })

        if (message == null) {
            return {
                headers: corsHeaders,
                statusCode: 404
            }
        }

        switch (method) {

            case 'PUT': {
                const request = JSON.parse(event.body)

                await message.update({
                    content: request.content
                })

                break;

            } case 'DELETE': {
                await message.destroy()

                break;
            }
        }

        return {
            headers: corsHeaders,
            statusCode: 204
        }
    } catch (err) {
        return {
            headers: corsHeaders,
            statusCode: 500
        }
    }
}