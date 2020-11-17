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
      CustomerLocation.belongsToMany(models.Location, {
        foreignKey: 'locationId'
      })
    }
  };
  CustomerLocation.init({
    customerId: DataTypes.INTEGER,
    locationId: DataTypes.INTEGER,
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