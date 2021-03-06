'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Load extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Load.belongsTo(models.Lane, {
        foreignKey: 'laneId',
      })
      Load.belongsTo(models.Carrier, {
        foreignKey: 'carrierId',
      })
      Load.belongsTo(models.Brokerage, {
        foreignKey: 'brokerageId',
      })
    }
  }
  Load.init(
    {
      loadId: DataTypes.INTEGER,
      brokerageId: DataTypes.INTEGER,
      laneId: DataTypes.INTEGER,
      carrierId: DataTypes.INTEGER,
      rate: DataTypes.INTEGER,
      dropDate: DataTypes.DATEONLY,
    },
    {
      sequelize,
      modelName: 'Load',
    }
  )
  return Load
}
