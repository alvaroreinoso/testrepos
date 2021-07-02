'use strict'

const lanes = require('../data/lanes')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Lanes', lanes, {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Lanes', null, {})
  },
}
