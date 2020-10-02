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