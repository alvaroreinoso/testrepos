'use strict';

const elastic = require('../elastic/hooks')
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
        elastic.saveDocument(lane)
      },
      afterDestroy: (lane, options) => {
        elastic.deleteDocument(lane)
      }
    },
    sequelize,
    modelName: 'Lane',
  });
  return Lane;
};