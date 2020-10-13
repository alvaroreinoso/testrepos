'use strict';

const elastic = require('../elastic/hooks')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LanePartner extends Model {
    static associate(models) {
      LanePartner.hasOne(models.CustomerLane, {
        foreignKey: 'lanePartnerId'
      })
    }
  };
  LanePartner.init({
    name: DataTypes.STRING,
    address: DataTypes.STRING,
    address2: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zipcode: DataTypes.STRING,
    lnglat: DataTypes.STRING,
    open: DataTypes.STRING,
    close: DataTypes.STRING,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    title: DataTypes.STRING,
    phone: DataTypes.STRING,
    phoneExt: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    hooks: {
      afterSave: (lanePartner, options) => {
        elastic.saveDocument(lanePartner)
      },
      afterDestroy: (lanePartner, options) => {
        elastic.deleteDocument(lanePartner)
      }
    },
    sequelize,
    modelName: 'LanePartner',
  });
  return LanePartner;
};