const laneHandler = require('../../handlers/lane')

describe('Test Get Lane by Id', () => {

    test('Get lane by Id with no token', async () => {

        const request = {
            headers: {
                Authorization: ''
            },
            pathParameters: {
                laneId: 1
            }
        }

        const response = await laneHandler.getLane(request)

        expect(response.statusCode).toStrictEqual(401)
    }
    )

    test('Get lane by Id with auth but wrong lane', async () => {

        const request = {
            headers: {
                Authorization: 'eyJraWQiOiJtZEtBYzdQZlkrNENLc2xrb0o4UTZTZmtcL2JDMTIyTlVFNUlyTmJZNDRxMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI3MGNmYzJlOS04NTA3LTQzNDktYWRlZS01YWUwMzUyZTQyMGMiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLnVzLWVhc3QtMS5hbWF6b25hd3MuY29tXC91cy1lYXN0LTFfV2dwRFdTdzlVIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjp0cnVlLCJjb2duaXRvOnVzZXJuYW1lIjoiNzBjZmMyZTktODUwNy00MzQ5LWFkZWUtNWFlMDM1MmU0MjBjIiwiYXVkIjoiMmI4YzBtZzdmM2psNXNvMmI3YThycHF2NGIiLCJldmVudF9pZCI6IjE0OWE1NGJjLTQ4YzItNGNjNS04NTc5LWJkOTNkYmQyNDZjMyIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNTk5NjYxODg3LCJwaG9uZV9udW1iZXIiOiIrMTYxNTEyMzQ1NzQiLCJleHAiOjE1OTk2NjU0ODcsImlhdCI6MTU5OTY2MTg4NywiZW1haWwiOiJ0ZmF5bmVAb3BsLmNvbSJ9.o7OvpDKEBe03KrgG-NbtZoCRa_XYEYrfu4R0L0I5Azn5QsrA1JgDGrvZSxfAGtts_V0nyy9gi3Q1uFxSMwyMJjsAl6D_W51r7OJ0Z6eyCQUQg6J26mZ2EF1ydJvcLTw86s9og2o2AbvhlBO3oblX4j-3qArAJF6BAULBHZxfg2xZpcJteOg9zNa_auZtWwIh5oqI8gdKRuAVgdKYS8UsWbiujNuWfV2sB4V7bGCWwXvNSRaTj2ZPIfZ9HFmHJhdPy7dP9XRzKWojxkYceRT9_Fctpons0uW6I3PqlLIos3u5gTyRDlH4HEyHLTrAQrRFsNc8vLYk_5k1JiOc74MwrA'
            },
            pathParameters: {
                laneId: 1
            }
        }

        const response = await laneHandler.getLane(request)

        expect(response.statusCode).toStrictEqual(404)
    })

    test('Get lane by Id with auth and correct lane', async () => {

        const request = {
            headers: {
                Authorization: 'eyJraWQiOiJtZEtBYzdQZlkrNENLc2xrb0o4UTZTZmtcL2JDMTIyTlVFNUlyTmJZNDRxMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI3MWRiY2JlZi1lNjVkLTQ3ZjItYTc5OC04ZTI5OGRkYjk5NTgiLCJhdWQiOiIyYjhjMG1nN2Yzamw1c28yYjdhOHJwcXY0YiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJldmVudF9pZCI6IjUxMTMzMmJkLWJmYTItNGUzYS1hYTgwLTY0ZmNiYzZiOTdkZSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjAxMzk1MTgyLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9XZ3BEV1N3OVUiLCJjb2duaXRvOnVzZXJuYW1lIjoiNzFkYmNiZWYtZTY1ZC00N2YyLWE3OTgtOGUyOThkZGI5OTU4IiwiZXhwIjoxNjAxMzk4NzgyLCJpYXQiOjE2MDEzOTUxODIsImVtYWlsIjoiamx5bGVzQG9wbC5jb20ifQ.rp8UCcNR2fwFQKp11JgaS-Cuysj0AiPOlLms921R1mNSZAHUbgbJeZb-VFLjYw092m3_0BgdSkOkEbnrMiaESSUiSoUoTltcYzT6mgayOtkdImr-135h-s4OE87Ig3tJAW-12-m71Hoqh_V9hqpiUoHHcJdoMbJCZ0jCh3wpKckdleIB-ANPRmaKeYUleJX287jGRasQY3H20QLlofHzzXbBEo5PC5BkDOHwLn7E5ujCk1HnuEwlBQQA95cKmZ093yN9mGeCF9EpmUcrGdrtqh2ynKvYH75AoRF0QpiWen3rnWKGx33_cruiHZMUt-jwuelTdD7RPlGpNrTnbjn7mA'
            },
            pathParameters: {
                laneId: 1
            }
        }

        const response = await laneHandler.getLane(request)

        expect(response.statusCode).toStrictEqual(200)
        expect(response.body).toContain('Lamont_Feil60@hotmail.com')
    })

    test('Get lane that doesnt exist', async () => {

        const request = {
            headers: {
                Authorization: 'eyJraWQiOiJtZEtBYzdQZlkrNENLc2xrb0o4UTZTZmtcL2JDMTIyTlVFNUlyTmJZNDRxMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI3MWRiY2JlZi1lNjVkLTQ3ZjItYTc5OC04ZTI5OGRkYjk5NTgiLCJhdWQiOiIyYjhjMG1nN2Yzamw1c28yYjdhOHJwcXY0YiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJldmVudF9pZCI6IjUxMTMzMmJkLWJmYTItNGUzYS1hYTgwLTY0ZmNiYzZiOTdkZSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjAxMzk1MTgyLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9XZ3BEV1N3OVUiLCJjb2duaXRvOnVzZXJuYW1lIjoiNzFkYmNiZWYtZTY1ZC00N2YyLWE3OTgtOGUyOThkZGI5OTU4IiwiZXhwIjoxNjAxMzk4NzgyLCJpYXQiOjE2MDEzOTUxODIsImVtYWlsIjoiamx5bGVzQG9wbC5jb20ifQ.rp8UCcNR2fwFQKp11JgaS-Cuysj0AiPOlLms921R1mNSZAHUbgbJeZb-VFLjYw092m3_0BgdSkOkEbnrMiaESSUiSoUoTltcYzT6mgayOtkdImr-135h-s4OE87Ig3tJAW-12-m71Hoqh_V9hqpiUoHHcJdoMbJCZ0jCh3wpKckdleIB-ANPRmaKeYUleJX287jGRasQY3H20QLlofHzzXbBEo5PC5BkDOHwLn7E5ujCk1HnuEwlBQQA95cKmZ093yN9mGeCF9EpmUcrGdrtqh2ynKvYH75AoRF0QpiWen3rnWKGx33_cruiHZMUt-jwuelTdD7RPlGpNrTnbjn7mA'
            },
            pathParameters: {
                laneId: 999
            }
        }

        const response = await laneHandler.getLane(request)

        expect(response.statusCode).toStrictEqual(404)
    })
})