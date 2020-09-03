'use strict';

const lanePartnerContacts = require("../data/lanePartnerContacts");

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('LanePartnerContacts', lanePartnerContacts, {});

  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('LanePartnerContacts', null, {});

  }
};
