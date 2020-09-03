'use strict';

const customerLocations = require("../data/customerLocations");

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('CustomerLocations', customerLocations, {});

  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('CustomerLocations', null, {});

  }
};
