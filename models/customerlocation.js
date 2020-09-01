'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerLocation extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CustomerLocation.belongsTo(models.Customer, {
        foreignKey: 'customerId'
      }),
      CustomerLocation.belongsTo(models.CustomerContact, {
        foreignKey: 'contactId'
      })
      CustomerLocation.hasMany(models.Lane, {
        foreignKey: 'customerLocationId'
      })
    }
  };
  CustomerLocation.init({
    customerId: DataTypes.INTEGER,
    contactId: DataTypes.INTEGER,
    address: DataTypes.STRING,
    address2: DataTypes.STRING,
    zipcode: DataTypes.STRING,
    lnglat: DataTypes.STRING,
    open: DataTypes.INTEGER,
    close: DataTypes.INTEGER,
    isHQ: DataTypes.BOOLEAN,
    isShippingReceiving: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'CustomerLocation',
  });
  return CustomerLocation;
};