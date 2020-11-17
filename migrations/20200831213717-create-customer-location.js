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
      locationId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      ledgerId: {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('CustomerLocations');
  }
};