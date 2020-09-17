var SequelizeMock = require('sequelize-mock');
const { sequelize } = require('../../models');
// const CustomerLane = sequelize.$overrideImport('../../models/CustomerLane', '../../mocks/CustomerLane');

const dbMock = new SequelizeMock();


// testEvent = {
//     pathParameters: {
//         lane_id: 1
//     }
// }

const CustomerLane = dbMock.define('customerLane', {
    customerLocationId: 1,
    lanePartnerId: 1,
    laneId: 1
})

// test('query customer lanes successfully', async () => {
//     const results = await CustomerLane.findOne({
//         where: {
//             customerLocationId: 1
//         }
//     })
//     expect(results.lanePartnerId).toBe(1)
// })

test('query customer lanes unsuccessfully', async () => {
    const results = await CustomerLane.findOne({
        where: {
            laneId: 60
        }
    })
    expect(results).toBe(null)
})

// test('adding a new CustomerLane', async () => {

//         const newLane = await CustomerLane.create({
//             customerLocationId: 2,
//             lanePartnerLocationId: 2,
//             customerIsShipper: true
//         })
//         const query = await CustomerLane.findOne({
//             where: {
//                 customerLocationId: 2,
//                 lanePartnerLocationId: 2
//             }
//         })
//         // console.log(query)
//         expect(query.lanePartnerLocationId).toBe(2)
// })

test('get all lanes', async () => {
    const lanes = await CustomerLane.findAll()
    console.log(lanes)
    expect(lanes).not.toBe(null)
})

// test('deleting a CustomerLane', async () => {
//     await CustomerLane.destroy({
//         where: {
//             id: 2
//         }
//     })
//     const result = await CustomerLane.findOne({
//         where: {
//             id: 10
//         }
//     })
//     expect(result).toBe(null)
// })