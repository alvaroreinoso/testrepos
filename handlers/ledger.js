'use strict';
const getCurrentUser = require('.././helpers/user').getCurrentUser
const { Ledger, Message, Customer, User } = require('.././models');

module.exports.getLedger = async (event, context) => {

    // ledger id included on customer drawer or user drawer

    // sent as path parameter

    const ledgerId = event.pathParameters.id


    const ledger = await Ledger.findAll({
        where: {
            id: ledgerId
        },
        include: [{
            model: Message,
            include: [{
                model: User
            }]
        }]
    })

    return {
        statusCode: 200,
        body: JSON.stringify(ledger)
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