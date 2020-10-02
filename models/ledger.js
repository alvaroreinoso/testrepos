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

      Ledger.belongsTo(models.Customer, {
        foreignKey: 'customerId'
      })
      Ledger.belongsTo(models.User, {
        foreignKey: 'userId'
      })
      Ledger.hasMany(models.Message, {
        foreignKey: 'ledgerId'
      })

    }
  };
  Ledger.init({
    userId: DataTypes.INTEGER,
    customerId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Ledger',
  });
  return Ledger;
};