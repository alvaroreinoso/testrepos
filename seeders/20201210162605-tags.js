'use strict'

const tags = require('../data/tags')
const laneTags = require('../data/laneTags')
const locationTags = require('../data/locationTags')
const customerTags = require('../data/customerTags')
const userTags = require('../data/userTags')
const teamTags = require('../data/teamTags')
const brokerageTags = require('../data/brokerageTags')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Tags', tags, {})
    await queryInterface.bulkInsert('LocationTags', locationTags, {})
    await queryInterface.bulkInsert('CustomerTags', customerTags, {})
    await queryInterface.bulkInsert('LaneTags', laneTags, {})
    await queryInterface.bulkInsert('UserTags', userTags, {})
    await queryInterface.bulkInsert('TeamTags', teamTags, {})
    await queryInterface.bulkInsert('BrokerageTags', brokerageTags, {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Tags', null, {})
    await queryInterface.bulkDelete('LocationTags', null, {})
    await queryInterface.bulkDelete('CustomerTags', null, {})
    await queryInterface.bulkDelete('LaneTags', null, {})
    await queryInterface.bulkDelete('UserTags', null, {})
    await queryInterface.bulkDelete('TeamTags', null, {})
    await queryInterface.bulkDelete('BrokerageTags', null, {})
  },
}
