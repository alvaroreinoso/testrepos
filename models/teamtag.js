'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class TeamTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TeamTag.init(
    {
      teamId: DataTypes.INTEGER,
      tagId: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: 'TeamTag',
    }
  )
  return TeamTag
}
