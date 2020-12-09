'use strict';
const elastic = require('../elastic/hooks')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {

    static associate(models) {
      
      Customer.belongsTo(models.Team, {
        foreignKey: 'teamId'
      })
      Customer.hasMany(models.CustomerLocation, {
        foreignKey: 'customerId'
      }),
      Customer.belongsTo(models.Ledger, {
        foreignKey: 'ledgerId'
      })
      Customer.belongsToMany(models.User, {
        through: 'TaggedCustomer',
        foreignKey: 'customerId'
      })
      Customer.belongsToMany(models.Contact, {
        through: 'CustomerContact',
        foreignKey: 'customerId'
      })
      Customer.belongsToMany(models.Tag, {
        through: 'CustomerTag',
        foreignKey: 'customerId'
      })
    }
  };
  Customer.init({
    name: DataTypes.STRING,
    industry: DataTypes.STRING,
    teamId: DataTypes.INTEGER,
    ledgerId: DataTypes.INTEGER,
    bio: DataTypes.TEXT
  }, {
    hooks: {
      afterSave: (customer, options) => {
        elastic.saveDocument(customer)
      },
      afterDestroy: (customer, options) => {
        elastic.deleteDocument(customer)
      }
    },
    sequelize,
    modelName: 'Customer',
  });
  return Customer;
};