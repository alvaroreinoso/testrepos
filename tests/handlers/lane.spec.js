const laneHandler = require('../../handlers/lane')

const mockEvent = {
    headers: {
        Authorization: ''
    },
    pathParameters: {
        laneId: 1
    }
}

test('get lane with no auth', () => {
    expect(laneHandler.getLane(mockEvent)).toBe('{}')
})