'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      address: {
        type: Sequelize.STRING
      },
      city: {
        type: Sequelize.STRING
      },
      state: {
        type: Sequelize.STRING
      },
      zipcode: {
        type: Sequelize.STRING
      },
      contactId: {
        type: Sequelize.INTEGER
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
    await queryInterface.changeColumn('CustomerLocations', 'locationId', {
      type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Locations',
          key: 'id',
          as: 'locationId'
        }
    })
    await queryInterface.changeColumn('LanePartners', 'locationId', {
      type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Locations',
          key: 'id',
          as: 'locationId'
        }
    })
    await queryInterface.changeColumn('Lanes', 'originLocationId', {
      type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Locations',
          key: 'id',
          as: 'originLocationId'
        }
    })
    await queryInterface.changeColumn('Lanes', 'destinationLocationId', {
      type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Locations',
          key: 'id',
          as: 'destinationLocationId'
        }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Locations');
  }
};