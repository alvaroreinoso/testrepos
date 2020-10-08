'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
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
    content: DataTypes.STRING
  }, {
    hooks: {
      afterSave: (message, options) => {
        
      }
    },
    sequelize,
    modelName: 'Message',
  });
  return Message;
};