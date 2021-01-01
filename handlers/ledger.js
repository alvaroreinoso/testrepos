'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Ledger, Message, Customer, User } = require('.././models');

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
                    model: User
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
                statusCode: 404
            }
        }

        return {
            body: JSON.stringify(ledger),
            statusCode: 200
        }
    } catch (err) {
        console.log(err)
        return {
            statusCode: 500
        }
    }

}

module.exports.writeMessage = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {

        return {
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
                statusCode: 401
            }
        }

        const message = await Message.create({
            userId: user.id,
            ledgerId: request.ledgerId,
            content: request.content
        })

        return {
            statusCode: 204
        }

    } catch (err) {

        return {
            statusCode: 500
        }

    }

}

module.exports.deleteMessage = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {

        return {
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
                statusCode: 404
            }
        }

        await message.destroy()

        return {
            statusCode: 204
        }

    } catch (err) {

        return {
            statusCode: 500
        }
    }
}

module.exports.editMessage = async (event, context) => {


    try {
        const user = await getCurrentUser(event.headers.Authorization)

        if (user.id == undefined) {

            return {
                statusCode: 401
            }
        } 

        const messageId = event.pathParameters.id

        const request = JSON.parse(event.body)

        if (request.content == null) {

            return {
                statusCode: 400
            }
        }

        const message = await Message.findOne({
            where: {
                id: messageId,
                userId: user.id
            }
        })

        if (message == null) {

            return {
                statusCode: 404
            }
        }

        message.update({
            content: request.content
        })

        return {

            statusCode: 200
        }
    } catch (err) {

        return {
            statusCode: 500
        }
    }

}