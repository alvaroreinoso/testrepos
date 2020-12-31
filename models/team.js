'use strict';
const elastic = require('../elastic/hooks')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    static associate(models) {
      Team.hasMany(models.User, {
        foreignKey: 'teamId'
      }),
      Team.belongsTo(models.Brokerage, {
        foreignKey: 'brokerageId'
      })
      Team.belongsTo(models.Ledger, {
        foreignKey: 'ledgerId',
        onDelete: 'CASCADE'
      })
      Team.belongsToMany(models.Tag, {
        through: 'TeamTag',
        foreignKey: 'teamId',
        onDelete: 'CASCADE'
      })
    }
  };
  Team.init({
    name: DataTypes.STRING,
    brokerageId: DataTypes.INTEGER,
    icon: DataTypes.STRING,
    ledgerId: DataTypes.INTEGER
  }, {
    hooks: {
      afterSave: (team, options) => {
        elastic.saveDocument(team)
      },
      afterDestroy: (team, options) => {
        elastic.deleteDocument(team)
      }
    },
    sequelize,
    modelName: 'Team',
  });
  return Team;
};