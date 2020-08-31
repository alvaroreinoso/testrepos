'use strict';
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
      // define association here
      Brokerage.hasMany(models.User, {
        foreignKey: 'brokerageId'
      }),
      Brokerage.hasMany(models.Team, {
        foreignKey: 'brokerageId'
      })
    }
  };
  Brokerage.init({
    pin: DataTypes.STRING,
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    addres2: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zipcode: DataTypes.STRING,
    phone: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Brokerage',
  });
  return Brokerage;
};