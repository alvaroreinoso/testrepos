'use strict'
const elastic = require('../elastic/hooks')
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    static associate(models) {
      Team.hasMany(models.User, {
        foreignKey: 'teamId',
        onDelete: 'SET NULL',
      }),
        Team.belongsTo(models.Brokerage, {
          foreignKey: 'brokerageId',
        })
      Team.belongsTo(models.Ledger, {
        foreignKey: 'ledgerId',
        onDelete: 'CASCADE',
      })
      Team.belongsToMany(models.Tag, {
        through: 'TeamTag',
        foreignKey: 'teamId',
        onDelete: 'CASCADE',
      })
    }
  }
  Team.init(
    {
      name: DataTypes.STRING,
      brokerageId: DataTypes.INTEGER,
      icon: DataTypes.STRING,
      ledgerId: DataTypes.INTEGER,
    },
    {
      hooks: {
        afterCreate: async (team, options) => {
          await team.createLedger({
            brokerageId: team.brokerageId,
          })
        },
        afterSave: async (team, options) => {
          await elastic.saveDocument(team)
        },
        afterDestroy: async (team, options) => {
          await elastic.deleteDocument(team)
        },
      },
      sequelize,
      modelName: 'Team',
    }
  )
  return Team
}
