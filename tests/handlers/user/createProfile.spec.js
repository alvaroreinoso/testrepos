const userHandler = require('../../../handlers/user')

describe('Test getUser Lambda', () => {

    test('Create Profile with invalid request body', async () => {

        const request = {
            // body: {
                usernvalidKey: 'invalidValue'
            // }
        }

        const response = await userHandler.createProfile(JSON.stringify(request))

        expect(response.statusCode).toStrictEqual(500)
    })

    test('Create Profile with valid request body', async () => {

        const request = {
            body: {
                username: "test-test-test",
                email: "test@gmail.com",
                brokerageId: 3
            }
        }

        const req = JSON.stringify(request)

        const response = await userHandler.createProfile(JSON.stringify(request))

        expect(response.statusCode).toStrictEqual(200)
    })


})