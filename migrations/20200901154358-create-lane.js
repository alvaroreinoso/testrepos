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
      customerLocationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'CustomerLocations',
          key: 'id',
          as: 'customerLocationId'
        }
      },
      lanePartnerLocationId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        // references: {
        //   model: 'LanePartnerLocations',
        //   key: 'id',
        //   as: 'lanePartnerLocationId'
        // }
      },
      truckType: {
        type: Sequelize.STRING
      },
      customerIsShipper: {
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
    await queryInterface.dropTable('Lanes');
  }
};