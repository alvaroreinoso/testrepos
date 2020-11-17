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
      Location.belongsTo(models.Customer, {
        through: 'customerLocations',
        foreignKey: 'customerId'
      })
      Location.belongsTo(models.CustomerContact, {
        foreignKey: 'contactId'
      })
      Location.hasOne(models.LanePartner, {
        foreignKey: 'locationId'
      }),
      Location.belongsTo(models.Lane, {
        foreignKey: 'originLocationId',
      })
      Location.belongsTo(models.Ledger, {
        foreignKey: 'ledgerId',
      })
      Location.belongsTo(models.Lane, {
        foreignKey: 'destinationLocationId',
      })
    }
  };
  Location.init({
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zipcode: DataTypes.STRING,
    contactId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Location',
  });
  return Location;
};