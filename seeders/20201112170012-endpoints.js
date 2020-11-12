'use strict';
const endpoints = require('../data/endpoints')

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('Endpoints', endpoints, {});

  },

  down: async (queryInterface, Sequelize) => {
    
    await queryInterface.bulkDelete('Endpoints', null, {});
    
  }
};
