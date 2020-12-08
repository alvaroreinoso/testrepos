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
      Location.hasOne(models.LanePartner, {
        foreignKey: 'locationId'
      }),
      Location.hasMany(models.Lane, {
        foreignKey: 'originLocationId',
      })
      Location.hasMany(models.Lane, {
        foreignKey: 'destinationLocationId',
      })
      Location.belongsToMany(models.User, {
        through: 'TaggedLocation',
        foreignKey: 'locationId'
      })
      Location.belongsToMany(models.Contact, {
        through: 'LocationContact',
        foreignKey: 'locationId'
      })
    }
  };
  Location.init({
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zipcode: DataTypes.STRING,
    phone: DataTypes.STRING,
    lnglat: DataTypes.STRING,
    isHQ: DataTypes.BOOLEAN,
    isShippingReceiving: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'Location',
  });
  return Location;
};