'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('endpoints', [{
      customerLaneId: 1,
      customerLocationId: 1,
    },
  {
    customerLaneId: 1,
    customerLocationId: 2
  }], {});

  },

  down: async (queryInterface, Sequelize) => {
    
    await queryInterface.bulkDelete('endpoints', null, {});
    
  }
};
