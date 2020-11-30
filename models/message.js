'use strict';

const elastic = require('../elastic/hooks')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
  
    static associate(models) {
      Message.belongsTo(models.User, {
        foreignKey: 'userId'
      }),
      Message.belongsTo(models.Ledger, {
        foreignKey: 'ledgerId'
      })
    }
  };
  Message.init({
    userId: DataTypes.INTEGER,
    ledgerId: DataTypes.INTEGER,
    content: DataTypes.TEXT
  }, {
    hooks: {
      afterSave: (message, options) => {
        elastic.saveDocument(message)
      },
      afterDestroy: (message, options) => {
        elastic.deleteDocument(message)
      }
    },
    sequelize,
    modelName: 'Message',
  });
  return Message;
};