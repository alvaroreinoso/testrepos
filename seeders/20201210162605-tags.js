'use strict';

const tags = require('../data/tags')
const laneTags = require('../data/laneTags')
const locationTags = require('../data/locationTags')
const customerTags = require('../data/customerTags')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    await queryInterface.bulkInsert('Tags', tags, {});
    await queryInterface.bulkInsert('LocationTags', locationTags, {});
    await queryInterface.bulkInsert('CustomerTags', customerTags, {});
    await queryInterface.bulkInsert('LaneTags', laneTags, {});

  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Tags', null, {});
    await queryInterface.bulkDelete('LocationTags', null, {});
    await queryInterface.bulkDelete('CustomerTags', null, {});
    await queryInterface.bulkDelete('LaneTags', null, {});

  }
};