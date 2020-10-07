const ledgerHandler = require('../../../handlers/ledger')
require('dotenv').config()

const token = process.env.AUTH_TOKEN

describe('Test write message lambda', () => {

    test('Write message returns 401 with no auth', async () => {

        const request = {
            headers: {
                Authorization: '',
            },
            body: {
                "ledgerId": 1,
                "content": "hey man what's goin on"
            } 
        }

        const response = await ledgerHandler.writeMessage(request)

        expect(response.statusCode).toBe(401)
    })

    // test('Write message returns 401 when attempting to write to ledger outside of brokerage', async () => {

    //     const request = {
    //         headers: {
    //             Authorization: token,
    //         },
    //         body: {
    //             "ledgerId": 10,
    //             "content": "hey man what's goin on"
    //         } 
    //     }

    //     const response = await ledgerHandler.writeMessage(request)

    //     expect(response.statusCode).toBe(401)
    // })

    // test('Write message returns 204 when successfully writing to ledger', async () => {

    //     const request = {"headers": '{Authorization: token}' , "body": '{"ledgerId": 1, "content": "hey man whats goin on"}'}

    //     const reqstr = await request.toString()

    //     console.log(reqstr)

    //     const response = await ledgerHandler.writeMessage(request)

    //     expect(response.statusCode).toBe(204)
    // }) 
})