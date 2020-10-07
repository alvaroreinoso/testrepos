'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Ledger, Message, Customer, User } = require('.././models');

module.exports.getLedger = async (event, context) => {

    const ledgerId = event.pathParameters.id

    const user = await getCurrentUser(event.headers.Authorization)

    const ledger = await Ledger.findOne({
        where: {
            id: ledgerId
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

    try {

    if (ledger.Customer == null) {

        if (ledger.User.brokerageId == user.brokerageId) {

            return {
                statusCode: 200,
                body: JSON.stringify(ledger)
            }

        } else {

            return {
                statusCode: 401
            }

        }
    }

    if (ledger.User == null) {

        if (ledger.Customer.brokerageId == user.brokerageId) {

            return {
                statusCode: 200,
                body: JSON.stringify(ledger)
            }

        } else {

            return {
                statusCode: 401
            }

        }
    }

    } catch {

        return {
            statusCode: 404
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

        const message = await Message.create({
            userId: user.id,
            ledgerId: request.ledgerId,
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

module.exports.deleteMessage = async (event, context) => {

    const user = await getCurrentUser(event.headers.Authorization)

    if (user.id == null) {

        return {
            statusCode: 401
        }

    }

    try {

        const messageId = event.pathParameters.id

        await Message.destroy({
            where: {
                id: messageId,
                userId: user.id
            }
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