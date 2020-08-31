'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Team extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Team.hasMany(models.User, {
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