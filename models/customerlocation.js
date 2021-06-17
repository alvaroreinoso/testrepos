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
      CustomerLocation.belongsTo(models.Location, {
        foreignKey: 'locationId',
        onDelete: 'cascade',
        hooks: true
      })
    }
  };
  CustomerLocation.init({
    customerId: DataTypes.INTEGER,
    locationId: DataTypes.INTEGER,
  }, {
    hooks: {
      afterSave: async (customerLocation, options) => {
        await elastic.saveDocument(customerLocation)
      },
      afterDestroy: async (customerLocation, options) => {
        await elastic.deleteDocument(customerLocation)
      }
    },
    sequelize,
    modelName: 'CustomerLocation',
  });
  return CustomerLocation;
};