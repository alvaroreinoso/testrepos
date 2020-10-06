'use strict';
const users = require("../data/users");
const ledgers = require("../data/ledgers");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Ledgers', ledgers, {});
    await queryInterface.bulkInsert('Users', users, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Ledgers', null, {})
    await queryInterface.bulkDelete('Users', null, {});

  }
};
