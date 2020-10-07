const userHandler = require('../../../handlers/user')

describe('Test createProfile Lambda', () => {

    test('Create Profile with invalid request body', async () => {

        const request = {"body":'{"fakeKey":"test-test-test","notEmail":"test","notBrokerageId":3}'}

        const response = await userHandler.createProfile(request)

        expect(response.statusCode).toStrictEqual(500)
    })

    test('Create Profile with valid request body', async () => {

        const request = {"body":'{"username":"test-test-test","email":"test@gmail.com","brokerageId":2}'}

        const response = await userHandler.createProfile(request)

        expect(response.statusCode).toStrictEqual(200)
    })
})
