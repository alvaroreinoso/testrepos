'use strict';
const { addTag } = require('../elastic/hooks')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LocationTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  LocationTag.init({
    locationId: DataTypes.INTEGER,
    tagId: DataTypes.INTEGER
  }, {
    hooks: {
      afterCreate: async(locationTag, options) => {
        const tag = await sequelize.models.Tag.findOne({
          where: {
            id: locationTag.tagId
          }
        })
        await addTag(locationTag.locationId, tag.content, 'customer_location')
      }
    },
    sequelize,
    modelName: 'LocationTag',
  });
  return LocationTag;
};