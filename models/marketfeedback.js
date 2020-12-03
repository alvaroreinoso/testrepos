'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MarketFeedback extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      MarketFeedback.belongsTo(models.Lane, {
        foreignKey: 'laneId'
      })
    }
  };
  MarketFeedback.init({
    rate: DataTypes.INTEGER,
    motorCarrierNumber: DataTypes.STRING,
    laneId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'MarketFeedback',
  });
  return MarketFeedback;
};