'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Ledger, Message, Customer, User } = require('.././models');
const corsHeaders = {
    'Access-Control-Allow-Origin': process.env.ORIGIN_URL,
    'Access-Control-Allow-Credentials': true,
}

module.exports.getLedger = async (event, context) => {

    try {
        const ledgerId = event.pathParameters.id

        const user = await getCurrentUser(event.headers.Authorization)

        const ledger = await Ledger.findOne({
            where: {
                id: ledgerId,
                brokerageId: user.brokerageId
            },
            include: [{
                model: Message,
                include: [{
                    model: User,
                    paranoid: false
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

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {

        return {
            headers: corsHeaders,
            statusCode: 401
        }

    }

    try {

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
                statusCode: 401
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

module.exports.deleteMessage = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {

        return {
            headers: corsHeaders,
            statusCode: 401
        }
    }

    try {
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

        await message.destroy()

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

        if (user.id == undefined) {

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

                message.update({
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