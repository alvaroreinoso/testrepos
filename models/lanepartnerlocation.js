'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LanePartnerLocation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      LanePartnerLocation.hasMany(models.Lane, {
        foreignKey: 'lanePartnerLocationId'
      }),
      LanePartnerLocation.belongsTo(models.LanePartner, {
        foreignKey: 'lanePartnerId'
      })
    }
  };
  LanePartnerLocation.init({
    lanePartnerId: DataTypes.INTEGER,
    contactId: DataTypes.INTEGER,
    address: DataTypes.STRING,
    address2: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zipcode: DataTypes.STRING,
    lnglat: DataTypes.STRING,
    open: DataTypes.STRING,
    close: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'LanePartnerLocation',
  });
  return LanePartnerLocation;
};