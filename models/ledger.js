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
        foreignKey: 'ledgerId',
        onDelete: 'cascade',
        hooks: true
      })
      Ledger.hasOne(models.User, {
        foreignKey: 'ledgerId'
      })
      Ledger.hasOne(models.Location, {
        foreignKey: 'ledgerId'
      })
      Ledger.hasMany(models.Message, {
        foreignKey: 'ledgerId',
        onDelete: 'CASCADE'
      })
      Ledger.hasOne(models.Lane, {
        foreignKey: 'ledgerId'
      })
      Ledger.hasOne(models.Team, {
        foreignKey: 'ledgerId',
        onDelete: 'CASCADE'
      })
      Ledger.belongsTo(models.Brokerage, {
        foreignKey: 'brokerageId'
      })
      Ledger.hasOne(models.Brokerage, {
        foreignKey: 'ledgerId'
      })

    }
  };
  Ledger.init({
    brokerageId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Ledger',
  });
  return Ledger;
};