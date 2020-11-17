'use strict';

const elastic = require('../elastic/hooks')

const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerLocation extends Model {
    static associate(models) {
      CustomerLocation.belongsTo(models.Customer, {
        foreignKey: 'customerId'
      }),
      CustomerLocation.belongsTo(models.CustomerContact, {
        foreignKey: 'contactId'
      })
      CustomerLocation.belongsTo(models.Ledger, {
        foreignKey: 'ledgerId'
      })
      CustomerLocation.belongsToMany(models.Location, {
        foreignKey: 'locationId'
      })
    }
  };
  CustomerLocation.init({
    customerId: DataTypes.INTEGER,
    contactId: DataTypes.INTEGER,
    locationId: DataTypes.INTEGER,
    ledgerId: DataTypes.INTEGER
  }, {
    hooks: {
      afterSave: (customerLocation, options) => {
        elastic.saveDocument(customerLocation)
      },
      afterDestroy: (customerLocation, options) => {
        elastic.deleteDocument(customerLocation)
      }
    },
    sequelize,
    modelName: 'CustomerLocation',
  });
  return CustomerLocation;
};