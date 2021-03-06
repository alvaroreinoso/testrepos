const userHandler = require('../../../handlers/user')

describe('Test getTeams Lambda', () => {
  test('returns 401 with no token', async () => {
    const request = {
      headers: {
        Authorization: '',
      },
    }

    const response = await userHandler.getTeams(request)

    expect(response.statusCode).toStrictEqual(401)
  })

  test('returns 200 with teams response', async () => {
    const request = {
      headers: {
        Authorization:
          'eyJraWQiOiJtZEtBYzdQZlkrNENLc2xrb0o4UTZTZmtcL2JDMTIyTlVFNUlyTmJZNDRxMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI3MWRiY2JlZi1lNjVkLTQ3ZjItYTc5OC04ZTI5OGRkYjk5NTgiLCJhdWQiOiIyYjhjMG1nN2Yzamw1c28yYjdhOHJwcXY0YiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJldmVudF9pZCI6IjUxMTMzMmJkLWJmYTItNGUzYS1hYTgwLTY0ZmNiYzZiOTdkZSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjAxMzk1MTgyLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9XZ3BEV1N3OVUiLCJjb2duaXRvOnVzZXJuYW1lIjoiNzFkYmNiZWYtZTY1ZC00N2YyLWE3OTgtOGUyOThkZGI5OTU4IiwiZXhwIjoxNjAxMzk4NzgyLCJpYXQiOjE2MDEzOTUxODIsImVtYWlsIjoiamx5bGVzQG9wbC5jb20ifQ.rp8UCcNR2fwFQKp11JgaS-Cuysj0AiPOlLms921R1mNSZAHUbgbJeZb-VFLjYw092m3_0BgdSkOkEbnrMiaESSUiSoUoTltcYzT6mgayOtkdImr-135h-s4OE87Ig3tJAW-12-m71Hoqh_V9hqpiUoHHcJdoMbJCZ0jCh3wpKckdleIB-ANPRmaKeYUleJX287jGRasQY3H20QLlofHzzXbBEo5PC5BkDOHwLn7E5ujCk1HnuEwlBQQA95cKmZ093yN9mGeCF9EpmUcrGdrtqh2ynKvYH75AoRF0QpiWen3rnWKGx33_cruiHZMUt-jwuelTdD7RPlGpNrTnbjn7mA',
      },
    }

    const response = await userHandler.getTeams(request)

    expect(response.statusCode).toStrictEqual(200)
    expect(JSON.parse(response.body)[0]).toHaveProperty('name', 'Team Lyles')
  })
})
