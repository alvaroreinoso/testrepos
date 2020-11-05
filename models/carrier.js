'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Carrier extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Carrier.hasMany(models.Load, {
        foreignKey: 'carrierId'
      })
    }
  };
  Carrier.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Carrier',
  });
  return Carrier;
};