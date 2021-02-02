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
      afterSave: async (message, options) => {
        await elastic.saveDocument(message)
      },
      afterDestroy: async (message, options) => {
        await elastic.deleteDocument(message)
      }
    },
    sequelize,
    modelName: 'Message',
  });
  return Message;
};