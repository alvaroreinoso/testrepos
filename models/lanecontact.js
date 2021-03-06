'use strict'
const elastic = require('../elastic/hooks')
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class LaneContact extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  LaneContact.init(
    {
      laneId: DataTypes.INTEGER,
      contactId: DataTypes.INTEGER,
    },
    {
      hooks: {},
      sequelize,
      modelName: 'LaneContact',
    }
  )
  return LaneContact
}
