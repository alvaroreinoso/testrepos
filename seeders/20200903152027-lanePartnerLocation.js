'use strict';

const lanePartnerLocations = require("../data/lanePartnerLocations");

module.exports = {
  up: async (queryInterface, Sequelize) => {
   
     await queryInterface.bulkInsert('LanePartnerLocations', lanePartnerLocations, {});
    
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('LanePartnerLocations', null, {});
    
  }
};
