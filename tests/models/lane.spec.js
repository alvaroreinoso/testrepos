var SequelizeMock = require('sequelize-mock');
const { sequelize } = require('../../models');
// const Lane = sequelize.$overrideImport('../../models/lane', '../../mocks/lane');

const dbMock = new SequelizeMock();


testEvent = {
    pathParameters: {
        lane_id: 1
    }
}

const Lane = dbMock.define('lane', {
    customerLocationId: 1,
    lanePartnerLocationId: 1,
    truckType: null,
    customerIsShipper: true
})

test('query lanes successfully', async () => {
    const results = await Lane.findOne({
        where: {
            customerLocationId: 1
        }
    })
    expect(results.lanePartnerLocationId).toBe(1)
})

test('adding a new lane', async () => {
    describe('testing describee', async () => {

        const newLane = await Lane.create({
            customerLocationId: 2,
            lanePartnerLocationId: 2,
            customerIsShipper: true
        })
        const query = await Lane.findOne({
            where: {
                customerLocationId: 2,
                lanePartnerLocationId: 2
            }
        })
        // console.log(query)
        expect(query.lanePartnerLocationId).toBe(2)


    })
})

test('get all lanes', async () => {
    const lanes = await Lane.findOne({
        where: {
            id: 123
        }
    })
    console.log(lanes)
    expect(lanes).not.toBe(null)
})

// test('deleting a lane', async () => {
//     await Lane.destroy({
//         where: {
//             id: 2
//         }
//     })
//     const result = await Lane.findOne({
//         where: {
//             id: 10
//         }
//     })
//     expect(result).toBe(null)
// })