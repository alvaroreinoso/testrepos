const SequelizeMock = require('sequelize-mock')
const mockDb = new SequelizeMock()

mockDb.User = mockDb.define(
  'Users',
  {
    email: 'testing@terralanes.com',
    username: 'testing-testing-testing',
    picture: 'cat.img',
  },
  {
    instanceMethods: {
      getCustomers: async function () {
        return 'Test User'
      },
    },
  }
)

mockDb.Brokerage = mockDb.define('Brokerages', {
  name: 'Test Brokerage',
  pin: 'testing-testing',
})

mockDb.User.belongsTo(mockDb.brokerage)

module.exports = mockDb
