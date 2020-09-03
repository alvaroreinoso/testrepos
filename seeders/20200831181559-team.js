'use strict';

const teams = require("../data/teams");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Teams', teams, {});
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Teams', null, {});

  }
};
