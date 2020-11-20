'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Location extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Location.hasOne(models.CustomerLocation, {
        foreignKey: 'locationId'
      })
      Location.belongsTo(models.CustomerContact, {
        foreignKey: 'contactId'
      })
      Location.hasOne(models.LanePartner, {
        foreignKey: 'locationId'
      }),
      Location.hasMany(models.Lane, {
        foreignKey: 'originLocationId',
      })
      Location.belongsTo(models.Ledger, {
        foreignKey: 'ledgerId',
      })
      Location.hasMany(models.Lane, {
        foreignKey: 'destinationLocationId',
      })
    }
  };
  Location.init({
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zipcode: DataTypes.STRING,
    contactId: DataTypes.INTEGER,
    ledgerId: DataTypes.INTEGER,
    lnglat: DataTypes.STRING,
    isHQ: DataTypes.BOOLEAN,
    isShippingReceiving: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Location',
  });
  return Location;
};