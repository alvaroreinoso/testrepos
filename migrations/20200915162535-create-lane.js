'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Lanes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      originLocationId: {
        type: Sequelize.INTEGER
      },
      destinationLocationId: {
        type: Sequelize.INTEGER
      },
      brokerageId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Brokerages',
          key: 'id',
          as: 'brokerageId'
        },
        allowNull: false
      },
      owned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      routeGeometry: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ledgerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      frequency: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      rate: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      mileage: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      inbound: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      userAddedRate: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    await queryInterface.dropTable('Lanes');
  }
};