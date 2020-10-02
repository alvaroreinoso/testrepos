'use strict';

const ledgers = require('../data/ledgers')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    await queryInterface.bulkInsert('Ledgers', ledgers, {});

  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Ledgers', null, {});

  }
};
