'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Customer extends Model {

    static associate(models) {
      
      Customer.belongsTo(models.User, {
        foreignKey: 'userId',
      }),
      Customer.belongsTo(models.Team, {
        foreignKey: 'teamId'
      })
      Customer.hasMany(models.CustomerLocation, {
        foreignKey: 'customerId'
      }),
      Customer.belongsTo(models.Ledger, {
        foreignKey: 'ledgerId'
      })
    }
  };
  Customer.init({
    name: DataTypes.STRING,
    industry: DataTypes.STRING,
    userId: DataTypes.INTEGER,
    teamId: DataTypes.INTEGER,
    ledgerId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Customer',
  });
  return Customer;
};