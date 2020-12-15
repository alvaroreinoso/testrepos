'use strict';
const elastic = require('../elastic/hooks')
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
      User.belongsTo(models.Ledger, {
        foreignKey: 'ledgerId'
      }),
      User.belongsToMany(models.Lane, {
        through: 'TaggedLane',
        foreignKey: 'userId'
      })
      User.belongsToMany(models.Location, {
        through: 'TaggedLocation',
        foreignKey: 'userId'
      })
      User.belongsToMany(models.Customer, {
        through: 'TaggedCustomer',
        foreignKey: 'userId'
      })
      User.belongsToMany(models.Tag, {
        through: 'UserTag',
        foreignKey: 'userId'
      })
    }
  };
  User.init({
    username: DataTypes.STRING,
    brokerageId: DataTypes.INTEGER,
    ledgerId: DataTypes.INTEGER,
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
    hooks: {
      afterSave: (user, options) => {
        elastic.saveDocument(user)
      },
      afterDestroy: (user, options) => {
        elastic.deleteDocument(user)
      }
    },
    sequelize,
    modelName: 'User',
  });
  return User;
};