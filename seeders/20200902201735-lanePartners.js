'use strict'

const lanePartners = require('../data/lanePartners')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('LanePartners', lanePartners, {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('LanePartners', null, {})
  },
}
