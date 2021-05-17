'use strict';
const elastic = require('../elastic/hooks')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {

    static associate(models) {
      
      Customer.belongsTo(models.Brokerage, {
        foreignKey: 'brokerageId'
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
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    logo: DataTypes.STRING,
    displayName: DataTypes.STRING,
    industry: DataTypes.STRING,
    brokerageId: DataTypes.INTEGER,
    ledgerId: DataTypes.INTEGER,
    bio: DataTypes.TEXT
  }, {
    hooks: {
      afterCreate: async (customer, options) => {
        await customer.createLedger({
          brokerageId: customer.brokerageId
        })
      },
      afterSave: async (customer, options) => {
        await elastic.saveDocument(customer)
      },
      afterDestroy: async (customer, options) => {
        await elastic.deleteDocument(customer)
      }
    },
    sequelize,
    modelName: 'Customer',
  });
  return Customer;
};