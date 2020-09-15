'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerLane extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
    }
  };
  CustomerLane.init({
    customerLocationId: DataTypes.INTEGER,
    lanePartnerId: DataTypes.INTEGER,
    laneId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'CustomerLane',
  });
  return CustomerLane;
};