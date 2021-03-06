'use strict'
const elastic = require('../elastic/hooks')
const Sequelize = require('sequelize')
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsTo(models.Team, {
        foreignKey: 'teamId',
      }),
        User.belongsTo(models.Brokerage, {
          foreignKey: 'brokerageId',
        }),
        User.hasMany(models.Message, {
          foreignKey: 'userId',
        })
      User.belongsTo(models.Ledger, {
        foreignKey: 'ledgerId',
      }),
        User.belongsToMany(models.Lane, {
          through: 'TaggedLane',
          foreignKey: 'userId',
        })
      User.belongsToMany(models.Location, {
        through: 'TaggedLocation',
        foreignKey: 'userId',
      })
      User.belongsToMany(models.Customer, {
        through: 'TaggedCustomer',
        foreignKey: 'userId',
      })
      User.belongsToMany(models.Tag, {
        through: 'UserTag',
        foreignKey: 'userId',
      })
    }
  }
  User.init(
    {
      username: DataTypes.STRING,
      brokerageId: DataTypes.INTEGER,
      ledgerId: DataTypes.INTEGER,
      teamId: DataTypes.INTEGER,
      confirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      title: DataTypes.STRING,
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      fullName: {
        type: Sequelize.VIRTUAL,
        get() {
          return `${this.getDataValue('firstName')} ${this.getDataValue('lastName')}`
        },
      },
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      phoneExt: DataTypes.STRING,
      profileImage: DataTypes.STRING,
    },
    {
      hooks: {
        afterCreate: async (user, options) => {
          await user.createLedger({
            brokerageId: user.brokerageId,
          })
        },
        afterSave: async (user, options) => {
          await elastic.saveDocument(user)
        },
        afterDestroy: async (user, options) => {
          await elastic.deleteDocument(user)
        },
      },
      sequelize,
      paranoid: true,
      modelName: 'User',
    }
  )
  return User
}
