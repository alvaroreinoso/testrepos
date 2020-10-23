'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerLane extends Model {
    static associate(models) {
      CustomerLane.belongsTo(models.Lane, {
        foreignKey: 'laneId'
      })
      CustomerLane.belongsTo(models.LanePartner, {
        foreignKey: 'lanePartnerId'
      })
      CustomerLane.belongsTo(models.CustomerLocation, {
        foreignKey: 'customerLocationId'
      })
      CustomerLane.belongsToMany(models.User, {
        through: 'LaneOwner',
        foreignKey: 'customerLaneId'
      })
    }
  };
  CustomerLane.init({
    customerLocationId: DataTypes.INTEGER,
    lanePartnerId: DataTypes.INTEGER,
    laneId: DataTypes.INTEGER,
    routeGeometry: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'CustomerLane',
  });
  return CustomerLane;
};