'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class TaggedLane extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TaggedLane.init(
    {
      userId: DataTypes.INTEGER,
      laneId: DataTypes.INTEGER,
    },
    {
      timestamps: false,
      sequelize,
      modelName: 'TaggedLane',
    }
  )
  return TaggedLane
}
