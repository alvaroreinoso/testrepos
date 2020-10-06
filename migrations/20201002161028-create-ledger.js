'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Ledgers', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
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
    await queryInterface.changeColumn('Users', 'ledgerId', {
      type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Ledgers',
          key: 'id',
          as: 'ledgerId'
        }
    })
    await queryInterface.changeColumn('Customers', 'ledgerId', {
      type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Ledgers',
          key: 'id',
          as: 'ledgerId'
        }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Ledgers');
  }
};