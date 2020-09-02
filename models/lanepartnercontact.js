'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LanePartnerContact extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      LanePartnerContact.hasMany(models.LanePartnerLocation, {
        foreignKey: 'contactId'
      })
    }
  };
  LanePartnerContact.init({
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    title: DataTypes.STRING,
    phone: DataTypes.STRING,
    phoneExt: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'LanePartnerContact',
  });
  return LanePartnerContact;
};