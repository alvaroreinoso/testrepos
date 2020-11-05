'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Loads', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      loadId: {
        type: Sequelize.INTEGER,
        unique: true
      },
      customerLaneId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'CustomerLanes',
          key: 'id',
          as: 'customerLaneId'
        }
      },
      rate: {
        type: Sequelize.STRING,
        allowNull: true
      },
      dropDate: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      carrierId: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
    await queryInterface.dropTable('Loads');
  }
};