'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    static associate(models) {
      Team.hasMany(models.User, {
        foreignKey: 'teamId'
      }),
      Team.hasMany(models.Customer, {
        foreignKey: 'teamId'
      }),
      Team.belongsTo(models.Brokerage, {
        foreignKey: 'brokerageId'
      })
    }
  };
  Team.init({
    name: DataTypes.STRING,
    brokerageId: DataTypes.INTEGER,
    icon: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Team',
  });
  return Team;
};