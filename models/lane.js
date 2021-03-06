'use strict'
const Sequelize = require('sequelize')
const elastic = require('../elastic/hooks')
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Lane extends Model {
    static associate(models) {
      Lane.hasMany(models.Load, {
        foreignKey: 'laneId',
      })
      Lane.hasMany(models.Carrier, {
        foreignKey: 'laneId',
        onDelete: 'cascade',
        hooks: true,
      })
      Lane.hasMany(models.MarketFeedback, {
        foreignKey: 'laneId',
        onDelete: 'cascade',
        hooks: true,
      })
      Lane.belongsTo(models.Location, {
        foreignKey: 'originLocationId',
        as: 'origin',
      })
      Lane.belongsTo(models.Location, {
        foreignKey: 'destinationLocationId',
        as: 'destination',
      })
      Lane.belongsTo(models.Ledger, {
        foreignKey: 'ledgerId',
      })
      Lane.belongsTo(models.Brokerage, {
        foreignKey: 'brokerageId',
      })
      Lane.belongsToMany(models.User, {
        through: 'TaggedLane',
        foreignKey: 'laneId',
      })
      Lane.belongsToMany(models.Contact, {
        through: 'LaneContact',
        foreignKey: 'laneId',
      })
      Lane.belongsToMany(models.Tag, {
        through: 'LaneTag',
        foreignKey: 'laneId',
      })
    }
  }
  Lane.init(
    {
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
      rate: DataTypes.DECIMAL,
      requirements: DataTypes.TEXT,
      painPoints: DataTypes.TEXT,
      competitionAnalysis: DataTypes.TEXT,
      spend: {
        type: Sequelize.VIRTUAL,
        get() {
          return this.getDataValue('currentVolume') * this.getDataValue('rate')
        },
      },
      opportunitySpend: {
        type: Sequelize.VIRTUAL,
        get() {
          return this.getDataValue('opportunityVolume') * this.getDataValue('rate')
        },
      },
      potentialSpend: {
        type: Sequelize.VIRTUAL,
        get() {
          return this.getDataValue('potentialVolume') * this.getDataValue('rate')
        },
      },
    },
    {
      hooks: {
        afterCreate: async (lane, options) => {
          await lane.createLedger({
            brokerageId: lane.brokerageId,
          })
        },
        afterSave: async (lane, options) => {
          await elastic.saveDocument(lane)
        },
        beforeDestroy: async (lane, options) => {
          await sequelize.models.TaggedLane.destroy({
            where: {
              laneId: lane.id,
            },
          })
          await sequelize.models.MarketFeedback.destroy({
            where: {
              laneId: lane.id,
            },
          })
          await sequelize.models.Carrier.destroy({
            where: {
              laneId: lane.id,
            },
          })

          await sequelize.models.LaneContact.destroy({
            where: {
              laneId: lane.id,
            },
          })

          await sequelize.models.LaneTag.destroy({
            where: {
              laneId: lane.id,
            },
          })
        },
        afterDestroy: async (lane, options) => {
          await elastic.deleteDocument(lane)
        },
      },
      sequelize,
      modelName: 'Lane',
    }
  )
  return Lane
}
