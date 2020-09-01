'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LanePartner extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      LanePartner.hasOne(models.LanePartnerLocation, {
        foreignKey: 'lanePartnerId'
      })
    }
  };
  LanePartner.init({
    name: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'LanePartner',
  });
  return LanePartner;
};