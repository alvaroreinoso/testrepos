'use strict';
const elastic = require('../elastic/hooks')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Contact extends Model {
    static associate(models) {
      Contact.belongsToMany(models.Location, {
        through: 'LocationContact',
        foreignKey: 'contactId'
      })
      Contact.belongsToMany(models.Lane, {
        through: 'LaneContact',
        foreignKey: 'contactId'
      })
      Contact.belongsToMany(models.Customer, {
        through: 'CustomerContact',
        foreignKey: 'contactId'
      })
    }
  };
  Contact.init({
    level: DataTypes.INTEGER,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    title: DataTypes.STRING,
    phoneExt: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    hooks: {
      afterDestroy: (contact, options) => {
        elastic.deleteDocument(contact)
      }
    },
    sequelize,
    modelName: 'Contact',
  });
  return Contact;
};