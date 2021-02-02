'use strict';

const elastic = require('../elastic/hooks')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LanePartner extends Model {
    static associate(models) {
      LanePartner.belongsTo(models.Location, {
        foreignKey: 'locationId'
      })
    }
  };
  LanePartner.init({
    name: DataTypes.STRING,
    locationId: DataTypes.INTEGER
  }, {
    hooks: {
      afterSave: async (lanePartner, options) => {
        await elastic.saveDocument(lanePartner)
      },
      afterDestroy: async (lanePartner, options) => {
        await elastic.deleteDocument(lanePartner)
      }
    },
    sequelize,
    modelName: 'LanePartner',
  });
  return LanePartner;
};