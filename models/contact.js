'use strict';
const elastic = require('../elastic/hooks')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Contact extends Model {
    static associate(models) {
      Contact.belongsTo(models.Brokerage, {
        foreignKey: 'brokerageId'
      })
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
    brokerageId: DataTypes.INTEGER,
    level: DataTypes.INTEGER,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    title: DataTypes.STRING,
    phoneExt: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    hooks: {
      afterSave: async (contact, options) => {
        await elastic.saveContact(contact)
      },
      afterDestroy: async (contact, options) => {
        await elastic.deleteDocument(contact)
      }
    },
    sequelize,
    modelName: 'Contact',
  });
  return Contact;
};