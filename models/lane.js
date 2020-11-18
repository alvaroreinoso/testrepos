'use strict';

const elastic = require('../elastic/hooks')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Lane extends Model {
    static associate(models) {
      Lane.hasMany(models.Load, {
        foreignKey: 'laneId'
      })
      Lane.belongsTo(models.Location, {
        foreignKey: 'originLocationId',
        as: 'origin'
      })
      Lane.belongsTo(models.Location, {
        foreignKey: 'destinationLocationId',
        as: 'destination'
      })
      Lane.belongsToMany(models.User, {
        through: 'LaneOwner',
        foreignKey: 'laneId'
      })
    }
  };
  Lane.init({
    originLocationId: DataTypes.INTEGER,
    destinationLocationId: DataTypes.INTEGER,
    routeGeometry: DataTypes.STRING,
    frequency: DataTypes.STRING
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