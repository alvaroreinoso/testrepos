'use strict';
const { addTag } = require('../elastic/hooks')
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CustomerTag extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  CustomerTag.init({
    customerId: DataTypes.INTEGER,
    tagId: DataTypes.INTEGER
  }, {
    hooks: {
      afterCreate: async(customerTag, options) => {
        const tag = await sequelize.models.Tag.findOne({
          where: {
            id: customerTag.tagId
          }
        })
        await addTag(customerTag.customerId, tag.content, 'customer')
      }
    },
    sequelize,
    modelName: 'CustomerTag',
  });
  return CustomerTag;
};