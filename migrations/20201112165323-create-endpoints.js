'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('endpoints', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      customerLaneId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CustomerLanes',
          key: 'id',
          as: 'customerLaneId'
        }
      },
      customerLocationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CustomerLocations',
          key: 'id',
          as: 'customerLocationId'
        }
      },
      createdAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('endpoints');
  }
};