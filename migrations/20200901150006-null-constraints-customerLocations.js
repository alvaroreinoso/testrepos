'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CustomerLocations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      customerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Customers',
          key: 'id',
          as: 'customerId'
        }
      },
      contactId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CustomerContacts',
          key: 'id',
          as: 'contactId'
        }
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address2: {
        type: Sequelize.STRING
      },
      zipcode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      lnglat: {
        type: Sequelize.STRING
      },
      open: {
        type: Sequelize.INTEGER
      },
      close: {
        type: Sequelize.INTEGER
      },
      isHQ: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      isShippingReceiving: {
        type: Sequelize.BOOLEAN,
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CustomerLocations');
  }
};