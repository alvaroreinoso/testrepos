'use strict'
const Sequelize = require('sequelize')
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Carrier extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Carrier.hasMany(models.Load, {
        foreignKey: 'carrierId',
      })
      Carrier.belongsTo(models.Lane, {
        foreignKey: 'laneId',
      })
    }
  }
  Carrier.init(
    {
      name: DataTypes.STRING,
      laneId: DataTypes.INTEGER,
      serviceRating: DataTypes.INTEGER,
      historicalRate: DataTypes.INTEGER,
      mcn: DataTypes.INTEGER,
      contactPhone: DataTypes.STRING,
      contactEmail: DataTypes.STRING,
      contactName: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Carrier',
    }
  )
  return Carrier
}
