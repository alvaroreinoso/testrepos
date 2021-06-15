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
        foreignKey: 'locationId',
        onDelete: 'cascade',
        hooks: true
      })
      Location.hasOne(models.LanePartner, {
        foreignKey: 'locationId'
      }),
      Location.hasMany(models.Lane, {
        foreignKey: 'originLocationId',
        onDelete: 'cascade',
        hooks: true
      })
      Location.hasMany(models.Lane, {
        foreignKey: 'destinationLocationId',
        onDelete: 'cascade',
        hooks: true
      })
      Location.belongsToMany(models.User, {
        through: 'TaggedLocation',
        foreignKey: 'locationId'
      })
      Location.belongsToMany(models.Contact, {
        through: 'LocationContact',
        foreignKey: 'locationId'
      })
      Location.belongsTo(models.Ledger, {
        foreignKey: 'ledgerId',
      })
      Location.belongsTo(models.Brokerage, {
        foreignKey: 'brokerageId'
      })
      Location.belongsToMany(models.Tag, {
        through: 'LocationTag',
        foreignKey: 'locationId'
      })
    }
  };
  Location.init({
    address: DataTypes.STRING,
    brokerageId: DataTypes.INTEGER,
    owned: DataTypes.BOOLEAN,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zipcode: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    ledgerId: DataTypes.INTEGER,
    lnglat: {
      type: DataTypes.STRING,
    },
    open: DataTypes.STRING,
    close: DataTypes.STRING,
    hoursType: DataTypes.STRING,
    isHQ: DataTypes.BOOLEAN,
    isShippingReceiving: DataTypes.BOOLEAN,
    estimatedVolume: DataTypes.INTEGER,
    estimatedSpend: DataTypes.INTEGER,
    requirements: DataTypes.TEXT,
    painPoints: DataTypes.TEXT,
    competitionAnalysis: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'Location',
    hooks: {
      afterCreate: async (location, options) => {
        await location.createLedger({
          brokerageId: location.brokerageId
        })
      },
    }
  });
  return Location;
};