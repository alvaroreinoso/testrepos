'use strict';

const taggedLanes = require('../data/taggedLanes')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    await queryInterface.bulkInsert('TaggedLanes', taggedLanes, {});

  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('TaggedLanes', null, {});

  }
};