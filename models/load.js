'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Load extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Load.belongsTo(models.CustomerLane, {
        foreignKey: 'customerLaneId'
      })
      Load.belongsTo(models.Carrier, {
        foreignKey: 'carrierId'
      })
    }
  };
  Load.init({
    loadId: DataTypes.INTEGER,
    customerLaneId: DataTypes.INTEGER,
    carrierId: DataTypes.INTEGER,
    rate: DataTypes.STRING,
    frequency: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Load',
  });
  return Load;
};