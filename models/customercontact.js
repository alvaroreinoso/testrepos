'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerContact extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CustomerContact.hasMany(models.CustomerLocation, {
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