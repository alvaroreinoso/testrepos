'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('CustomerLanes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
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
      lanePartnerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'LanePartners',
          key: 'id',
          as: 'lanePartnerId'
        }
      },
      laneId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Lanes',
          key: 'id',
          as: 'laneId'
        }
      },
      routeGeometry: {
        type: Sequelize.TEXT
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
    await queryInterface.dropTable('CustomerLanes');
  }
};