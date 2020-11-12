'use strict';
const endpoints = require('../data/endpoints')

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('endpoints', endpoints, {});

  },

  down: async (queryInterface, Sequelize) => {
    
    await queryInterface.bulkDelete('endpoints', null, {});
    
  }
};
