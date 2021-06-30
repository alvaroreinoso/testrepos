var SequelizeMock = require('sequelize-mock')
var dbMock = new SequelizeMock()

var LaneMock = dbMock.define('lane', {
  customerLocationId: 1,
  lanePartnerLocationId: 1,
  truckType: null,
  customerIsShipper: true,
})

module.exports = LaneMock
