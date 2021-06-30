'use strict'
const carriers = require('../data/carriers')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Carriers', carriers)
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Carriers', null, {})
  },
}
