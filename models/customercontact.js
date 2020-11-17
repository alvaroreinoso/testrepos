'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerContact extends Model {
    
    static associate(models) {
      CustomerContact.hasMany(models.Location, {
        foreignKey: 'contactId'
      })
    }
  };
  CustomerContact.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    title: DataTypes.STRING,
    phone: DataTypes.STRING,
    phoneExt: DataTypes.STRING,
    email: DataTypes.STRING,
    contactLevel: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'CustomerContact',
  });
  return CustomerContact;
};