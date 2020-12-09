'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Tag.belongsToMany(models.Customer, {
        through: 'CustomerTag',
        foreignKey: 'tagId'
      })
      Tag.belongsToMany(models.Location, {
        through: 'LocationTag',
        foreignKey: 'tagId'
      })
      Tag.belongsToMany(models.Lane, {
        through: 'LaneTag',
        foreignKey: 'tagId'
      })
    }
  };
  Tag.init({
    type: DataTypes.STRING,
    content: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Tag',
  });
  return Tag;
};