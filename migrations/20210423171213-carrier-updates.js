'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Carriers', 'historicalRate', {
      type: Sequelize.INTEGER,
      allowNull: true
    })
    await queryInterface.addColumn('Carriers', 'mcn', {
      type: Sequelize.INTEGER,
      allowNull: true
    })
    await queryInterface.addColumn('Carriers', 'serviceRating', {
      type: Sequelize.INTEGER,
      allowNull: true
    })
    await queryInterface.addColumn('Carriers', 'contactName', {
      type: Sequelize.STRING,
      allowNull: true
    })
    await queryInterface.addColumn('Carriers', 'contactPhone', {
      type: Sequelize.STRING,
      allowNull: true
    })
    await queryInterface.addColumn('Carriers', 'contactEmail', {
      type: Sequelize.STRING,
      allowNull: true
    })
    await queryInterface.addColumn('Carriers', 'laneId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Lanes',
        key: 'id',
        as: 'laneId'
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('Carriers', 'historicalRate')
    await queryInterface.removeColumn('Carriers', 'mcn')
    await queryInterface.removeColumn('Carriers', 'contactPhone')
    await queryInterface.removeColumn('Carriers', 'contactEmail')
    await queryInterface.removeColumn('Carriers', 'contactName')
    await queryInterface.removeColumn('Carriers', 'laneId')
  }
};
