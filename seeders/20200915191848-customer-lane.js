'use strict';

const customerLanes = require('../data/customerLanes')

module.exports = {
  up: async (queryInterface, Sequelize) => {

     await queryInterface.bulkInsert('CustomerLanes', customerLanes, {});
    
  },

  down: async (queryInterface, Sequelize) => {
  
    await queryInterface.bulkDelete('CustomerLanes', null, {});
    
  }
};