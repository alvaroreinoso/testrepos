'use strict'

const taggedLocations = require('../data/taggedLocations')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('TaggedLocations', taggedLocations, {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('TaggedLocations', null, {})
  },
}
