'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Lane extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Lane.belongsTo(models.CustomerLocation, {
        foreignKey: 'customerLocationId'
      })
      Lane.belongsTo(models.LanePartnerLocation, {
        foreignKey: 'lanePartnerLocationId'
      })
    }
  };
  Lane.init({
    customerLocationId: DataTypes.INTEGER,
    lanePartnerLocationId: DataTypes.INTEGER,
    truckType: DataTypes.STRING,
    customerIsShipper: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Lane',
  });
  return Lane;
};