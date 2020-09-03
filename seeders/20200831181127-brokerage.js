'use strict';

const brokerages = require("../data/brokerages");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Brokerages', brokerages, {});
  },

  down: async (queryInterface, Sequelize) => {


    await queryInterface.bulkDelete('Brokerages', null, {});

  }
};
