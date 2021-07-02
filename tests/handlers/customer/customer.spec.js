const customerHandler = require('../../../handlers/customer')

describe('Test Customer Handler', () => {
  test('get customer returns 200 with customer', async () => {
    const request = {
      headers: {
        Authorization:
          'eyJraWQiOiJtZEtBYzdQZlkrNENLc2xrb0o4UTZTZmtcL2JDMTIyTlVFNUlyTmJZNDRxMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI3MWRiY2JlZi1lNjVkLTQ3ZjItYTc5OC04ZTI5OGRkYjk5NTgiLCJhdWQiOiIyYjhjMG1nN2Yzamw1c28yYjdhOHJwcXY0YiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJldmVudF9pZCI6IjUxMTMzMmJkLWJmYTItNGUzYS1hYTgwLTY0ZmNiYzZiOTdkZSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjAxMzk1MTgyLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9XZ3BEV1N3OVUiLCJjb2duaXRvOnVzZXJuYW1lIjoiNzFkYmNiZWYtZTY1ZC00N2YyLWE3OTgtOGUyOThkZGI5OTU4IiwiZXhwIjoxNjAxMzk4NzgyLCJpYXQiOjE2MDEzOTUxODIsImVtYWlsIjoiamx5bGVzQG9wbC5jb20ifQ.rp8UCcNR2fwFQKp11JgaS-Cuysj0AiPOlLms921R1mNSZAHUbgbJeZb-VFLjYw092m3_0BgdSkOkEbnrMiaESSUiSoUoTltcYzT6mgayOtkdImr-135h-s4OE87Ig3tJAW-12-m71Hoqh_V9hqpiUoHHcJdoMbJCZ0jCh3wpKckdleIB-ANPRmaKeYUleJX287jGRasQY3H20QLlofHzzXbBEo5PC5BkDOHwLn7E5ujCk1HnuEwlBQQA95cKmZ093yN9mGeCF9EpmUcrGdrtqh2ynKvYH75AoRF0QpiWen3rnWKGx33_cruiHZMUt-jwuelTdD7RPlGpNrTnbjn7mA',
      },
      pathParameters: {
        customerId: 1,
      },
    }

    const response = await customerHandler.getCustomer(request)
    const body = JSON.parse(response.body)

    expect(response.statusCode).toStrictEqual(200)
    expect(body).toHaveProperty('Team')
  })

  test('update customer returns 204 and adds bio', async () => {
    const body = {
      bio: 'updated bio',
    }

    const request = {
      headers: {
        Authorization:
          'eyJraWQiOiJtZEtBYzdQZlkrNENLc2xrb0o4UTZTZmtcL2JDMTIyTlVFNUlyTmJZNDRxMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI3MWRiY2JlZi1lNjVkLTQ3ZjItYTc5OC04ZTI5OGRkYjk5NTgiLCJhdWQiOiIyYjhjMG1nN2Yzamw1c28yYjdhOHJwcXY0YiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJldmVudF9pZCI6IjUxMTMzMmJkLWJmYTItNGUzYS1hYTgwLTY0ZmNiYzZiOTdkZSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjAxMzk1MTgyLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9XZ3BEV1N3OVUiLCJjb2duaXRvOnVzZXJuYW1lIjoiNzFkYmNiZWYtZTY1ZC00N2YyLWE3OTgtOGUyOThkZGI5OTU4IiwiZXhwIjoxNjAxMzk4NzgyLCJpYXQiOjE2MDEzOTUxODIsImVtYWlsIjoiamx5bGVzQG9wbC5jb20ifQ.rp8UCcNR2fwFQKp11JgaS-Cuysj0AiPOlLms921R1mNSZAHUbgbJeZb-VFLjYw092m3_0BgdSkOkEbnrMiaESSUiSoUoTltcYzT6mgayOtkdImr-135h-s4OE87Ig3tJAW-12-m71Hoqh_V9hqpiUoHHcJdoMbJCZ0jCh3wpKckdleIB-ANPRmaKeYUleJX287jGRasQY3H20QLlofHzzXbBEo5PC5BkDOHwLn7E5ujCk1HnuEwlBQQA95cKmZ093yN9mGeCF9EpmUcrGdrtqh2ynKvYH75AoRF0QpiWen3rnWKGx33_cruiHZMUt-jwuelTdD7RPlGpNrTnbjn7mA',
      },
      pathParameters: {
        customerId: 1,
      },
      body: JSON.stringify(body),
    }

    const getCustomerRequest = {
      headers: {
        Authorization:
          'eyJraWQiOiJtZEtBYzdQZlkrNENLc2xrb0o4UTZTZmtcL2JDMTIyTlVFNUlyTmJZNDRxMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI3MWRiY2JlZi1lNjVkLTQ3ZjItYTc5OC04ZTI5OGRkYjk5NTgiLCJhdWQiOiIyYjhjMG1nN2Yzamw1c28yYjdhOHJwcXY0YiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJldmVudF9pZCI6IjUxMTMzMmJkLWJmYTItNGUzYS1hYTgwLTY0ZmNiYzZiOTdkZSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjAxMzk1MTgyLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9XZ3BEV1N3OVUiLCJjb2duaXRvOnVzZXJuYW1lIjoiNzFkYmNiZWYtZTY1ZC00N2YyLWE3OTgtOGUyOThkZGI5OTU4IiwiZXhwIjoxNjAxMzk4NzgyLCJpYXQiOjE2MDEzOTUxODIsImVtYWlsIjoiamx5bGVzQG9wbC5jb20ifQ.rp8UCcNR2fwFQKp11JgaS-Cuysj0AiPOlLms921R1mNSZAHUbgbJeZb-VFLjYw092m3_0BgdSkOkEbnrMiaESSUiSoUoTltcYzT6mgayOtkdImr-135h-s4OE87Ig3tJAW-12-m71Hoqh_V9hqpiUoHHcJdoMbJCZ0jCh3wpKckdleIB-ANPRmaKeYUleJX287jGRasQY3H20QLlofHzzXbBEo5PC5BkDOHwLn7E5ujCk1HnuEwlBQQA95cKmZ093yN9mGeCF9EpmUcrGdrtqh2ynKvYH75AoRF0QpiWen3rnWKGx33_cruiHZMUt-jwuelTdD7RPlGpNrTnbjn7mA',
      },
      pathParameters: {
        customerId: 1,
      },
    }

    const response = await customerHandler.updateCustomer(request)

    expect(response.statusCode).toStrictEqual(204)

    const getCustomerResponse = await customerHandler.getCustomer(getCustomerRequest)

    expect(getCustomerResponse.statusCode).toStrictEqual(200)

    const customer = JSON.parse(getCustomerResponse.body)

    expect(customer).toHaveProperty('bio', body.bio)
    expect(customer).toHaveProperty('id', request.pathParameters.customerId)
  })

  test('get top customers returns users top customers', async () => {
    const request = {
      headers: {
        Authorization:
          'eyJraWQiOiJtZEtBYzdQZlkrNENLc2xrb0o4UTZTZmtcL2JDMTIyTlVFNUlyTmJZNDRxMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI3MWRiY2JlZi1lNjVkLTQ3ZjItYTc5OC04ZTI5OGRkYjk5NTgiLCJhdWQiOiIyYjhjMG1nN2Yzamw1c28yYjdhOHJwcXY0YiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJldmVudF9pZCI6IjUxMTMzMmJkLWJmYTItNGUzYS1hYTgwLTY0ZmNiYzZiOTdkZSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjAxMzk1MTgyLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9XZ3BEV1N3OVUiLCJjb2duaXRvOnVzZXJuYW1lIjoiNzFkYmNiZWYtZTY1ZC00N2YyLWE3OTgtOGUyOThkZGI5OTU4IiwiZXhwIjoxNjAxMzk4NzgyLCJpYXQiOjE2MDEzOTUxODIsImVtYWlsIjoiamx5bGVzQG9wbC5jb20ifQ.rp8UCcNR2fwFQKp11JgaS-Cuysj0AiPOlLms921R1mNSZAHUbgbJeZb-VFLjYw092m3_0BgdSkOkEbnrMiaESSUiSoUoTltcYzT6mgayOtkdImr-135h-s4OE87Ig3tJAW-12-m71Hoqh_V9hqpiUoHHcJdoMbJCZ0jCh3wpKckdleIB-ANPRmaKeYUleJX287jGRasQY3H20QLlofHzzXbBEo5PC5BkDOHwLn7E5ujCk1HnuEwlBQQA95cKmZ093yN9mGeCF9EpmUcrGdrtqh2ynKvYH75AoRF0QpiWen3rnWKGx33_cruiHZMUt-jwuelTdD7RPlGpNrTnbjn7mA',
      },
      pathParameters: {
        userId: 6,
      },
    }

    const response = await customerHandler.getTopCustomers(request)

    expect(response.statusCode).toStrictEqual(200)

    const customers = JSON.parse(response.body)

    customers.forEach((customer) => {
      expect(customer).toHaveProperty('name')
      expect(customer).toHaveProperty('spend')
      expect(customer.spend).not.toBeNull()
    })
  })

  test('get lanes for customer returns customers lanes', async () => {
    const request = {
      headers: {
        Authorization:
          'eyJraWQiOiJtZEtBYzdQZlkrNENLc2xrb0o4UTZTZmtcL2JDMTIyTlVFNUlyTmJZNDRxMD0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiI3MWRiY2JlZi1lNjVkLTQ3ZjItYTc5OC04ZTI5OGRkYjk5NTgiLCJhdWQiOiIyYjhjMG1nN2Yzamw1c28yYjdhOHJwcXY0YiIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJldmVudF9pZCI6IjUxMTMzMmJkLWJmYTItNGUzYS1hYTgwLTY0ZmNiYzZiOTdkZSIsInRva2VuX3VzZSI6ImlkIiwiYXV0aF90aW1lIjoxNjAxMzk1MTgyLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAudXMtZWFzdC0xLmFtYXpvbmF3cy5jb21cL3VzLWVhc3QtMV9XZ3BEV1N3OVUiLCJjb2duaXRvOnVzZXJuYW1lIjoiNzFkYmNiZWYtZTY1ZC00N2YyLWE3OTgtOGUyOThkZGI5OTU4IiwiZXhwIjoxNjAxMzk4NzgyLCJpYXQiOjE2MDEzOTUxODIsImVtYWlsIjoiamx5bGVzQG9wbC5jb20ifQ.rp8UCcNR2fwFQKp11JgaS-Cuysj0AiPOlLms921R1mNSZAHUbgbJeZb-VFLjYw092m3_0BgdSkOkEbnrMiaESSUiSoUoTltcYzT6mgayOtkdImr-135h-s4OE87Ig3tJAW-12-m71Hoqh_V9hqpiUoHHcJdoMbJCZ0jCh3wpKckdleIB-ANPRmaKeYUleJX287jGRasQY3H20QLlofHzzXbBEo5PC5BkDOHwLn7E5ujCk1HnuEwlBQQA95cKmZ093yN9mGeCF9EpmUcrGdrtqh2ynKvYH75AoRF0QpiWen3rnWKGx33_cruiHZMUt-jwuelTdD7RPlGpNrTnbjn7mA',
      },
      pathParameters: {
        customerId: 6,
      },
    }

    const response = await customerHandler.getLanesForCustomer(request)

    expect(response.statusCode).toStrictEqual(200)

    const lanes = JSON.parse(response.body)

    lanes.forEach((lane) => {
      expect(lane).toHaveProperty('origin')
      expect(lane).toHaveProperty('destination')
      expect(lane.origin).not.toBeNull()
      expect(lane.destination).not.toBeNull()
    })
  })
})
