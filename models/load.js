'use strict';
const setRate = require('../helpers/hooks/setRate').setRate
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Load extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Load.belongsTo(models.Lane, {
        foreignKey: 'laneId'
      })
      Load.belongsTo(models.Carrier, {
        foreignKey: 'carrierId'
      })
    }
  };
  Load.init({
    loadId: DataTypes.INTEGER,
    laneId: DataTypes.INTEGER,
    carrierId: DataTypes.INTEGER,
    rate: DataTypes.INTEGER,
    dropDate: DataTypes.DATEONLY
  }, {
    hooks: {
      afterSave: (load, options) => {
        setRate(load)
      },
    },
    sequelize,
    modelName: 'Load',
  });
  return Load;
};