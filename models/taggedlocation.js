'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class TaggedLocation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TaggedLocation.init(
    {
      locationId: DataTypes.INTEGER,
      userId: DataTypes.INTEGER,
    },
    {
      timestamps: false,
      sequelize,
      modelName: 'TaggedLocation',
    }
  )
  return TaggedLocation
}
