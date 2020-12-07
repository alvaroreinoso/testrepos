'use strict';

const elastic = require('../elastic/hooks')
const setRate = require('../helpers/hooks/setRate').setRate
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Lane extends Model {
    static associate(models) {
      Lane.hasMany(models.Load, {
        foreignKey: 'laneId'
      })
      Lane.hasMany(models.MarketFeedback, {
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
      Lane.belongsTo(models.Ledger, {
        foreignKey: 'ledgerId',
      })
      Lane.belongsToMany(models.User, {
        through: 'TaggedLane',
        foreignKey: 'laneId'
      })
      Lane.belongsToMany(models.Contact, {
        through: 'LaneContact',
        foreignKey: 'laneId'
      })
    }
  };
  Lane.init({
    originLocationId: DataTypes.INTEGER,
    destinationLocationId: DataTypes.INTEGER,
    routeGeometry: DataTypes.STRING,
    frequency: DataTypes.INTEGER,
    rate: DataTypes.INTEGER,
    userAddedRate: DataTypes.BOOLEAN
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