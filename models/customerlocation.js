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
      }),
      CustomerLocation.belongsToMany(models.CustomerLane, {
        through: 'Endpoint',
        foreignKey: 'customerLocationId'
      })
    }
  };
  CustomerLocation.init({
    customerId: DataTypes.INTEGER,
    contactId: DataTypes.INTEGER,
    address: DataTypes.STRING,
    address2: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zipcode: DataTypes.STRING,
    open: DataTypes.STRING,
    close: DataTypes.STRING,
    isHQ: DataTypes.BOOLEAN,
    isShippingReceiving: DataTypes.BOOLEAN,
    lnglat: DataTypes.STRING
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