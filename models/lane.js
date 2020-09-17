'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Lane extends Model {
    static associate(models) {
      Lane.hasMany(models.CustomerLane, {
        foreignKey: 'laneId'
      })
    }
  };
  Lane.init({
    origin: DataTypes.STRING,
    destination: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Lane',
  });
  return Lane;
};