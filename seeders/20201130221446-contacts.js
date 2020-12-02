'use strict';
const contacts = require('../data/contacts')
const laneContacts = require('../data/laneContacts')
const locationContacts = require('../data/locationContacts')
const customerContacts = require('../data/customerContacts')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    await queryInterface.bulkInsert('Contacts', contacts, {});
    await queryInterface.bulkInsert('LaneContacts', laneContacts, {});
    await queryInterface.bulkInsert('CustomerContacts', customerContacts, {});
    await queryInterface.bulkInsert('LocationContacts', locationContacts, {});

  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Contacts', null, {});
    await queryInterface.bulkDelete('LaneContacts', null, {});
    await queryInterface.bulkDelete('LocationContacts', null, {});
    await queryInterface.bulkDelete('CustomerContacts', null, {});

  }
}