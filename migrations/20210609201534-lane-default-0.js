'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Lanes', 'rate', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    })
    await queryInterface.changeColumn('Lanes', 'currentVolume', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    })
    await queryInterface.changeColumn('Lanes', 'opportunityVolume', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    })
    await queryInterface.changeColumn('Lanes', 'potentialVolume', {
      type: Sequelize.INTEGER,
      defaultValue: 0,
      allowNull: false
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('Lanes', 'rate', {
      type: Sequelize.INTEGER,
      allowNull: true
    })
    await queryInterface.changeColumn('Lanes', 'currentVolume', {
      type: Sequelize.INTEGER,
      allowNull: true
    })
    await queryInterface.changeColumn('Lanes', 'opportunityVolume', {
      type: Sequelize.INTEGER,
      allowNull: true
    })
    await queryInterface.changeColumn('Lanes', 'potentialVolume', {
      type: Sequelize.INTEGER,
      allowNull: true
    })
  }
};
