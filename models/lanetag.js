'use strict';
const { addTag } = require('../elastic/hooks')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LaneTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  LaneTag.init({
    laneId: DataTypes.INTEGER,
    tagId: DataTypes.INTEGER
  }, {
    hooks: {
      afterCreate: async(laneTag, options) => {
        const tag = await sequelize.models.Tag.findOne({
          where: {
            id: laneTag.tagId
          }
        })
        await addTag(laneTag.laneId, tag.content, 'lane')
      }
    },
    sequelize,
    modelName: 'LaneTag',
  });
  return LaneTag;
};