'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LaneOwner extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  LaneOwner.init({
    userId: DataTypes.INTEGER,
    customerLaneId: DataTypes.INTEGER
  }, {
    timestamps: false,
    sequelize,
    modelName: 'LaneOwner',
  });
  return LaneOwner;
};