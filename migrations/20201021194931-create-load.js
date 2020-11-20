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
      laneId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Lanes',
          key: 'id',
          as: 'laneId'
        }
      },
      rate: {
        type: Sequelize.STRING,
        allowNull: true
      },
      dropDate: {
        type: Sequelize.DATE,
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