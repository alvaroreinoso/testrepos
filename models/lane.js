'use strict';

const laneHook = require('../elastic/hooks/lane')
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
    hooks: {
      afterSave: (lane, options) => {
        laneHook.updateLane(lane)
      },
      afterDestroy: (lane, options) => {
        laneHook.destroyLane(lane)
      }
    },
    sequelize,
    modelName: 'Lane',
  });
  return Lane;
};