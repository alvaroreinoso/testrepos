'use strict';
const { addTag, deleteTag } = require('../elastic/hooks')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  UserTag.init({
    userId: DataTypes.INTEGER,
    tagId: DataTypes.INTEGER
  }, {
    hooks: {
      afterCreate: async (userTag, options) => {
        const tag = await sequelize.models.Tag.findOne({
          where: {
            id: userTag.tagId
          }
        })
        await addTag(userTag.userId, tag.content, 'user')
      },
      afterDestroy: async(userTag, options) => {
        const tag = await sequelize.models.Tag.findOne({
          where: {
            id: userTag.tagId
          }
        })
        await deleteTag(userTag.userId, tag.content, 'user')
      }
    },
    sequelize,
    modelName: 'UserTag',
  });
  return UserTag;
};