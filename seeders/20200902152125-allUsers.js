'use strict';
const users = require('../data/users')

module.exports = {
  up: async (queryInterface, Sequelize) => {
      await queryInterface.bulkInsert('Users', users, {})
  },

  down: async (queryInterface, Sequelize) => {
     await queryInterface.bulkDelete('Users', null, {});

  }
};
