'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('Lanes', 'rate', {
      type: Sequelize.DataTypes.DECIMAL,
      defaultValue: 0,
      allowNull: true
    });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.changeColumn('Lanes', 'rate', {
      type: Sequelize.DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true
    });
  }
};
