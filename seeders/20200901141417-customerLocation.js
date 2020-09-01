'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('CustomerLocations', [{
      customerId: 1,
      contactId: 1,
      address: 'test address',
      address2: 'test',
      zipcode: 'test',
      lnglat: '36.987-79.292',
      open: 1200,
      close: 1450,
      isHQ: true,
      isShippingReceiving: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {});
  },

  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('CustomerLocations', null, {});

  }
};
