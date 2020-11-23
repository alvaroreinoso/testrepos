'use strict';

const taggedCustomers = require('../data/taggedCustomers')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    await queryInterface.bulkInsert('TaggedCustomers', taggedCustomers, {});

  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('TaggedCustomers', null, {});

  }
};