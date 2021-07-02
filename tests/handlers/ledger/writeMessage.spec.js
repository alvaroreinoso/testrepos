const ledgerHandler = require('../../../handlers/ledger')
require('dotenv').config()

const token = process.env.AUTH_TOKEN

describe('Test write message lambda', () => {
  test('Write message returns 401 with no auth', async () => {
    const body = {
      ledgerId: 1,
      content: 'test',
    }

    const request = {
      headers: {
        Authorization: '',
      },
      body: JSON.stringify(body),
    }

    const response = await ledgerHandler.writeMessage(request)

    expect(response.statusCode).toBe(401)
  })

  test('Write message returns 401 when attempting to write to ledger outside of brokerage', async () => {
    const body = {
      ledgerId: 10,
      content: 'test',
    }

    const request = {
      headers: {
        Authorization: token,
      },
      body: JSON.stringify(body),
    }

    const response = await ledgerHandler.writeMessage(request)

    expect(response.statusCode).toBe(401)
  })

  test('Write message returns 204 when successfully writing to ledger', async () => {
    const body = {
      ledgerId: 1,
      content: 'yo whats up',
    }

    const request = {
      headers: {
        Authorization: token,
      },
      body: JSON.stringify(body),
    }

    const response = await ledgerHandler.writeMessage(request)

    expect(response.statusCode).toBe(204)
  })
})
