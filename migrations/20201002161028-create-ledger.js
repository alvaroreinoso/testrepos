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
      brokerageId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'Brokerages',
          key: 'id',
          as: 'brokerageId'
        }
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
        allowNull: true,
        references: {
          model: 'Ledgers',
          key: 'id',
          as: 'ledgerId'
        }
    })
    await queryInterface.changeColumn('Customers', 'ledgerId', {
      type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Ledgers',
          key: 'id',
          as: 'ledgerId'
        }
    })
    await queryInterface.changeColumn('Teams', 'ledgerId', {
      type: Sequelize.INTEGER,
        allowNull: true,
        onDelete: 'CASCADE',
        references: {
          model: 'Ledgers',
          key: 'id',
          as: 'ledgerId'
        }
    })
    await queryInterface.changeColumn('Lanes', 'ledgerId', {
      type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'Ledgers',
          key: 'id',
          as: 'ledgerId'
        }
    })
    await queryInterface.changeColumn('Brokerages', 'ledgerId', {
      type: Sequelize.INTEGER,
        allowNull: true,
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