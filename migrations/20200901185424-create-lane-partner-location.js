'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('LanePartnerLocations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      lanePartnerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      contactId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address2: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING,
        allowNull: false
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false
      },
      zipcode: {
        type: Sequelize.STRING,
        allowNull: false
      },
      open: {
        type: Sequelize.STRING
      },
      close: {
        type: Sequelize.STRING
      },
      lnglat: {
        type: Sequelize.STRING,
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
    await queryInterface.changeColumn('Lanes', 'lanePartnerLocationId', {
      type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'LanePartnerLocations',
          key: 'id',
          as: 'lanePartnerLocationId'
        }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('LanePartnerLocations');
  }
};