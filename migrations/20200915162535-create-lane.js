'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Lanes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      originLocationId: {
        type: Sequelize.INTEGER,
      },
      destinationLocationId: {
        type: Sequelize.INTEGER,
      },
      brokerageId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Brokerages',
          key: 'id',
          as: 'brokerageId',
        },
        allowNull: false,
      },
      owned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      routeGeometry: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ledgerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      currentVolume: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      potentialVolume: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      opportunityVolume: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      truckType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      rate: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      mileage: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      inbound: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      requirements: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      painPoints: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      competitionAnalysis: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Lanes')
  },
}
