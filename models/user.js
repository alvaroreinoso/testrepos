'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Team, {
        foreignKey: 'teamId'
      }),
      User.belongsTo(models.Brokerage, {
        foreignKey: 'brokerageId'
      }),
      User.hasMany(models.Customer, {
        foreignKey: 'userId'
      })
    }
  };
  User.init({
    username: DataTypes.STRING,
    brokerageId: DataTypes.INTEGER,
    teamId: DataTypes.INTEGER,
    confirmed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    title: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    profileImage: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};