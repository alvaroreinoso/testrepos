'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Ledger extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {

      Ledger.hasOne(models.Customer, {
        foreignKey: 'ledgerId'
      })
      Ledger.hasOne(models.User, {
        foreignKey: 'ledgerId'
      })
      Ledger.hasMany(models.Message, {
        foreignKey: 'ledgerId'
      })

    }
  };
  Ledger.init({
  }, {
    sequelize,
    modelName: 'Ledger',
  });
  return Ledger;
};