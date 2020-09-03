'use strict';

const customerContacts = require("../data/customerContacts");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('CustomerContacts', customerContacts, {});
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('CustomerContacts', null, {});

  }
};
