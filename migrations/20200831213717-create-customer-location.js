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
        references: {
          model: 'Customers',
          key: 'id',
          as: 'customerId'
        }
      },
      contactId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'CustomerContacts',
          key: 'id',
          as: 'contactId'
        }
      },
      address: {
        type: Sequelize.STRING
      },
      address2: {
        type: Sequelize.STRING
      },
      zipcode: {
        type: Sequelize.STRING
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
        type: Sequelize.BOOLEAN
      },
      isShippingReceiving: {
        type: Sequelize.BOOLEAN
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