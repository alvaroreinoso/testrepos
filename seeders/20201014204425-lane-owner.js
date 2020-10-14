'use strict';

const laneOwners = require('../data/laneOwners')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    await queryInterface.bulkInsert('LaneOwners', laneOwners, {});

  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('LaneOwners', null, {});

  }
};