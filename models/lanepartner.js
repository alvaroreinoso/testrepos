'use strict'

const elastic = require('../elastic/hooks')
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class LanePartner extends Model {
    static associate(models) {
      LanePartner.belongsTo(models.Location, {
        foreignKey: 'locationId',
      })
    }
  }
  LanePartner.init(
    {
      name: DataTypes.STRING,
      locationId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'LanePartner',
    }
  )
  return LanePartner
}
