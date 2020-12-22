'use strict';
const elastic = require('../elastic/hooks')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerContact extends Model {
    static associate(models) {
      // define association here
    }
  };
  CustomerContact.init({
    customerId: DataTypes.INTEGER,
    contactId: DataTypes.INTEGER
  }, {
    hooks: {
  
    },
    sequelize,
    modelName: 'CustomerContact',
  });
  return CustomerContact;
};