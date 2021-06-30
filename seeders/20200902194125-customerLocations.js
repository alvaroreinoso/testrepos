'use strict'

const customerLocations = require('../data/customerLocations')
const locations = require('../data/locations')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Locations', locations, {})

    await queryInterface.bulkInsert('CustomerLocations', customerLocations, {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Locations', null, {})
    await queryInterface.bulkDelete('CustomerLocations', null, {})
  },
}
