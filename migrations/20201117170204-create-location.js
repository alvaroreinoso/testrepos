'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Locations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      address: {
        type: Sequelize.STRING,
      },
      address2: {
        type: Sequelize.STRING,
        allowNull: true,
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
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      zipcode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      phone: {
        type: Sequelize.STRING,
      },
      owned: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      ledgerId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Ledgers',
          key: 'id',
          as: 'ledgerId',
        },
      },
      isHQ: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      isShippingReceiving: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      lnglat: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      open: {
        type: Sequelize.STRING,
      },
      close: {
        type: Sequelize.STRING,
      },
      hoursType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: true,
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
      estimatedVolume: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      estimatedSpend: {
        type: Sequelize.INTEGER,
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
    await queryInterface.changeColumn('Lanes', 'originLocationId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Locations',
        key: 'id',
        as: 'originLocationId',
      },
    })
    await queryInterface.changeColumn('Lanes', 'destinationLocationId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Locations',
        key: 'id',
        as: 'destinationLocationId',
      },
    })
    await queryInterface.changeColumn('LanePartners', 'locationId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Locations',
        key: 'id',
        as: 'locationId',
      },
    })
    await queryInterface.changeColumn('CustomerLocations', 'locationId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Locations',
        key: 'id',
        as: 'locationId',
      },
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Locations')
  },
}
