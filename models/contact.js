'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Contact extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Contact.belongsToMany(models.Location, {
        through: 'LocationContact',
        foreignKey: 'contactId'
      })
      Contact.belongsToMany(models.Lane, {
        through: 'LaneContact',
        foreignKey: 'contactId'
      })
      Contact.belongsToMany(models.Customer, {
        through: 'CustomerContact',
        foreignKey: 'contactId'
      })
    }
  };
  Contact.init({
    level: DataTypes.INTEGER,
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Contact',
  });
  return Contact;
};