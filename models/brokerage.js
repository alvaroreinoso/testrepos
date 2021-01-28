'use strict';
const elastic = require('../elastic/hooks')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Brokerage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Brokerage.hasMany(models.User, {
        foreignKey: 'brokerageId'
      }),
      Brokerage.hasMany(models.Customer, {
        foreignKey: 'brokerageId'
      }),
      Brokerage.hasMany(models.Team, {
        foreignKey: 'brokerageId'
      })
      Brokerage.hasMany(models.Ledger, {
        foreignKey: 'brokerageId'
      })
      Brokerage.belongsTo(models.Ledger, {
        foreignKey: 'ledgerId'
      })
      Brokerage.belongsToMany(models.Tag, {
        through: 'BrokerageTag',
        foreignKey: 'brokerageId'
      })

    }
  };
  Brokerage.init({
    pin: DataTypes.STRING,
    name: DataTypes.STRING,
    ledgerId: DataTypes.INTEGER,
    address: DataTypes.STRING,
    address2: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zipcode: DataTypes.STRING,
    phone: DataTypes.STRING
  }, {
    hooks: {
      afterSave: async (brokerage, options) => {
        await elastic.saveDocument(brokerage)
      },
      afterDestroy: async (brokerage, options) => {
        await elastic.deleteDocument(brokerage)
      }
    },
    sequelize,
    modelName: 'Brokerage',
  });
  return Brokerage;
};