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
        references: {
          model: 'LanePartners',
          key: 'id',
          as: 'lanePartnerId'
        }
      },
      contactId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'LanePartnerContacts',
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
      lnglat: {
        type: Sequelize.STRING
      },
      open: {
        type: Sequelize.STRING
      },
      close: {
        type: Sequelize.STRING
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
    await queryInterface.dropTable('LanePartnerLocations');
  }
};