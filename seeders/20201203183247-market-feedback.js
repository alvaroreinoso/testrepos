'use strict'

const marketFeedbacks = require('../data/marketFeedbacks')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('MarketFeedbacks', marketFeedbacks, {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('MarketFeedbacks', null, {})
  },
}
