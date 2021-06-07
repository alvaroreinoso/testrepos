'use strict';
const Sequelize = require('sequelize');
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
      Lane.hasMany(models.Carrier, {
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
      Lane.belongsTo(models.Brokerage, {
        foreignKey: 'brokerageId'
      })
      Lane.belongsToMany(models.User, {
        through: 'TaggedLane',
        foreignKey: 'laneId'
      })
      Lane.belongsToMany(models.Contact, {
        through: 'LaneContact',
        foreignKey: 'laneId'
      })
      Lane.belongsToMany(models.Tag, {
        through: 'LaneTag',
        foreignKey: 'laneId'
      })
    }
  };
  Lane.init({
    originLocationId: DataTypes.INTEGER,
    destinationLocationId: DataTypes.INTEGER,
    brokerageId: DataTypes.INTEGER,
    ledgerId: DataTypes.INTEGER,
    owned: DataTypes.BOOLEAN,
    routeGeometry: DataTypes.STRING,
    currentVolume: DataTypes.INTEGER,
    potentialVolume: DataTypes.INTEGER,
    opportunityVolume: DataTypes.INTEGER,
    truckType: DataTypes.STRING,
    mileage: DataTypes.INTEGER,
    inbound: DataTypes.BOOLEAN,
    rate: DataTypes.INTEGER,
    requirements: DataTypes.TEXT,
    painPoints: DataTypes.TEXT,
    competitionAnalysis: DataTypes.TEXT,
    spend: {
      type: Sequelize.VIRTUAL,
      get () {
        return this.getDataValue('currentVolume') * this.getDataValue('rate')
      }
    },
    opportunitySpend: {
      type: Sequelize.VIRTUAL,
      get () {
        return this.getDataValue('opportunityVolume') * this.getDataValue('rate')
      }
    },
    potentialSpend: {
      type: Sequelize.VIRTUAL,
      get () {
        return this.getDataValue('potentialVolume') * this.getDataValue('rate')
      }
    }
  }, {
    hooks: {
      afterCreate: async (lane, options) => {
        await lane.createLedger({
          brokerageId: lane.brokerageId
        })
      },
      afterSave: async (lane, options) => {
        await elastic.saveDocument(lane)
      },
      afterDestroy: async (lane, options) => {
        await elastic.deleteDocument(lane)
      }
    },
    sequelize,
    modelName: 'Lane',
  });
  return Lane;
};