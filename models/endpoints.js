'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class endpoints extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  endpoints.init({
    customerLaneId: DataTypes.INTEGER,
    customerLocationId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'endpoints',
  });
  return endpoints;
};