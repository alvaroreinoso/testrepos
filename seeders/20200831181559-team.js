'use strict'
const ledgers = require('../data/ledgers')
const teams = require('../data/teams')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Ledgers', ledgers, {})

    await queryInterface.changeColumn('Brokerages', 'ledgerId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Ledgers',
        key: 'id',
        as: 'ledgerId',
      },
    })

    await queryInterface.bulkInsert('Teams', teams, {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Ledgers', null, {})
    await queryInterface.bulkDelete('Teams', null, {})
  },
}
